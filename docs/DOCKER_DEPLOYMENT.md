# Docker Deployment Guide

This guide explains how to deploy Psikotakip using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- At least 4GB RAM available
- 20GB disk space

## Quick Start

### 1. Login to Oracle Container Registry

```bash
docker login container-registry.oracle.com
# Username: Your Oracle account email
# Password: Your Oracle account password
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

### 3. Start Services

```bash
docker-compose up -d
```

This will:
- Pull Oracle Database XE 21c image
- Build the Next.js application
- Create a network for services
- Start both containers

### 4. Initialize Database

Wait for Oracle to be healthy (about 2 minutes):

```bash
docker-compose logs -f oracle-db
```

When you see "DATABASE IS READY TO USE!", proceed:

```bash
# Access Oracle container
docker exec -it psikotakip-oracle sqlplus system/OraclePassword123@XEPDB1

# Create user and schema
@/docker-entrypoint-initdb.d/startup/schema.sql

# Create procedures
@/docker-entrypoint-initdb.d/startup/procedures/user_management.sql
@/docker-entrypoint-initdb.d/startup/procedures/gamification.sql

EXIT;
```

### 5. Access Application

- Application: http://localhost:9002
- Oracle EM Express: https://localhost:5500/em/

## Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f oracle-db
```

### Stop Services

```bash
docker-compose stop
```

### Restart Services

```bash
docker-compose restart
```

### Stop and Remove Containers

```bash
docker-compose down
```

### Stop and Remove Everything (including volumes)

```bash
docker-compose down -v
```

## Configuration

### Environment Variables

Edit `docker-compose.yml` to customize:

**Oracle Database:**
```yaml
environment:
  - ORACLE_PWD=YourStrongPassword
  - ORACLE_CHARACTERSET=AL32UTF8
```

**Application:**
```yaml
environment:
  - NODE_ENV=production
  - ORACLE_USER=psikotakip_user
  - ORACLE_PASSWORD=YourPassword
  - JWT_SECRET=your-32-char-secret
```

### Resource Limits

Add resource limits to services:

```yaml
services:
  oracle-db:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Production Deployment

### 1. Use Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Install Oracle Instant Client
RUN apk add --no-cache libaio libnsl libc6-compat wget unzip && \
    wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linuxx64.zip && \
    unzip instantclient-basic-linuxx64.zip && \
    mv instantclient_*_* /opt/oracle/instantclient && \
    rm instantclient-basic-linuxx64.zip

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient:$LD_LIBRARY_PATH

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 9002
ENV PORT=9002
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### 2. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  oracle-db:
    image: container-registry.oracle.com/database/express:21.3.0-xe
    container_name: psikotakip-oracle-prod
    restart: always
    ports:
      - "1521:1521"
    environment:
      - ORACLE_PWD=${ORACLE_SYS_PASSWORD}
      - ORACLE_CHARACTERSET=AL32UTF8
    volumes:
      - oracle-prod-data:/opt/oracle/oradata
    networks:
      - psikotakip-prod
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 3G

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: psikotakip-app-prod
    restart: always
    ports:
      - "9002:9002"
    environment:
      - NODE_ENV=production
      - ORACLE_USER=${ORACLE_USER}
      - ORACLE_PASSWORD=${ORACLE_PASSWORD}
      - ORACLE_CONNECTION_STRING=oracle-db:1521/XEPDB1
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - GOOGLE_GENAI_API_KEY=${GOOGLE_GENAI_API_KEY}
    depends_on:
      - oracle-db
    networks:
      - psikotakip-prod
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  nginx:
    image: nginx:alpine
    container_name: psikotakip-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - psikotakip-prod

networks:
  psikotakip-prod:
    driver: bridge

volumes:
  oracle-prod-data:
    driver: local
```

### 3. Deploy to Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Backup and Restore

### Backup Database

```bash
# Create backup
docker exec psikotakip-oracle expdp \
  psikotakip_user/password@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=backup_$(date +%Y%m%d).dmp

# Copy backup from container
docker cp psikotakip-oracle:/opt/oracle/oradata/backup_20240101.dmp ./backups/
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backups/backup_20240101.dmp psikotakip-oracle:/opt/oracle/oradata/

# Restore
docker exec psikotakip-oracle impdp \
  psikotakip_user/password@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=backup_20240101.dmp
```

### Automated Backups

Add cron job:

```bash
# Backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec psikotakip-oracle expdp \
  psikotakip_user/password@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=backup_$DATE.dmp

docker cp psikotakip-oracle:/opt/oracle/oradata/backup_$DATE.dmp ./backups/

# Keep only last 30 days
find ./backups -name "backup_*.dmp" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

## Monitoring

### Container Stats

```bash
docker stats psikotakip-app psikotakip-oracle
```

### Application Logs

```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Monitoring

```bash
# Connect to database
docker exec -it psikotakip-oracle sqlplus psikotakip_user/password@XEPDB1

# Check sessions
SELECT username, status, COUNT(*) 
FROM v$session 
WHERE username = 'PSIKOTAKIP_USER'
GROUP BY username, status;

# Check tablespace
SELECT tablespace_name, bytes/1024/1024 AS MB
FROM user_segments
WHERE segment_type = 'TABLE';
```

## Troubleshooting

### Oracle Container Won't Start

```bash
# Check logs
docker logs psikotakip-oracle

# Check disk space
df -h

# Remove old containers and volumes
docker-compose down -v
docker system prune -a
```

### Application Can't Connect to Database

```bash
# Test connection from app container
docker exec -it psikotakip-app sh
ping oracle-db

# Check Oracle listener
docker exec psikotakip-oracle lsnrctl status
```

### Port Already in Use

```bash
# Find process using port
lsof -i :9002
lsof -i :1521

# Kill process or change port in docker-compose.yml
```

## Scaling

### Horizontal Scaling

```bash
# Scale application containers
docker-compose up -d --scale app=3
```

### Load Balancing

Add nginx configuration in `docker-compose.yml`:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  depends_on:
    - app
```

Create `nginx-lb.conf`:

```nginx
upstream backend {
    least_conn;
    server app_1:9002;
    server app_2:9002;
    server app_3:9002;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

## Security Best Practices

1. **Use secrets management**:
   ```bash
   echo "your_password" | docker secret create oracle_password -
   ```

2. **Limit network exposure**:
   ```yaml
   ports:
     - "127.0.0.1:1521:1521"  # Only localhost
   ```

3. **Regular updates**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

4. **Use non-root user** (already implemented in Dockerfile)

5. **Enable SSL/TLS** in production

## Support

For Docker-related issues:
- Check logs: `docker-compose logs`
- Inspect containers: `docker inspect <container>`
- GitHub Issues: https://github.com/curiousbrutus/psiko-takip-firebase/issues
