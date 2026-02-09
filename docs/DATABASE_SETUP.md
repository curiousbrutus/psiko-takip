# Psikotakip - Local Oracle Database Setup Guide

This guide will help you set up the Psikotakip application to work with a local Oracle database instead of Firebase.

## Prerequisites

### 1. Oracle Database Installation

You need to have Oracle Database installed. Supported versions:
- Oracle Database 19c or later
- Oracle Database 21c XE (Express Edition) - Recommended for development

#### Installing Oracle XE 21c on Linux/Ubuntu

```bash
# Download Oracle Database XE from Oracle website
# https://www.oracle.com/database/technologies/xe-downloads.html

# Install prerequisites
sudo apt-get update
sudo apt-get install -y alien libaio1 unixodbc

# Convert and install RPM package
sudo alien -i oracle-database-xe-21c*.rpm

# Configure the database
sudo /etc/init.d/oracle-xe-21c configure

# Set environment variables
echo "export ORACLE_HOME=/opt/oracle/product/21c/dbhomeXE" >> ~/.bashrc
echo "export ORACLE_SID=XE" >> ~/.bashrc
echo "export PATH=\$PATH:\$ORACLE_HOME/bin" >> ~/.bashrc
source ~/.bashrc
```

#### Installing Oracle XE on Windows

1. Download Oracle Database XE from [Oracle website](https://www.oracle.com/database/technologies/xe-downloads.html)
2. Run the installer
3. Set the SYS and SYSTEM passwords during installation
4. Complete the installation wizard

### 2. Node.js Environment

- Node.js 20.x or later
- npm or yarn package manager

## Database Setup

### Step 1: Create Database User

Connect to Oracle as SYSTEM user:

```sql
sqlplus system/your_password@localhost:1521/XEPDB1
```

Create the application user:

```sql
-- Create user
CREATE USER psikotakip_user IDENTIFIED BY "YourSecurePassword123!";

-- Grant necessary privileges
GRANT CONNECT, RESOURCE TO psikotakip_user;
GRANT CREATE SESSION TO psikotakip_user;
GRANT CREATE TABLE TO psikotakip_user;
GRANT CREATE VIEW TO psikotakip_user;
GRANT CREATE SEQUENCE TO psikotakip_user;
GRANT CREATE TRIGGER TO psikotakip_user;
GRANT CREATE PROCEDURE TO psikotakip_user;
GRANT UNLIMITED TABLESPACE TO psikotakip_user;

-- Additional privileges for production
GRANT CREATE JOB TO psikotakip_user;
GRANT SELECT ANY DICTIONARY TO psikotakip_user;

EXIT;
```

### Step 2: Run Database Schema

Connect as the application user:

```bash
sqlplus psikotakip_user/YourSecurePassword123!@localhost:1521/XEPDB1
```

Run the schema creation script:

```sql
@database/schema.sql
```

### Step 3: Create Stored Procedures

Run the procedure scripts:

```sql
@database/procedures/user_management.sql
@database/procedures/gamification.sql
```

### Step 4: (Optional) Load Seed Data

```sql
@database/seeds/sample_data.sql
```

## Application Configuration

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Configuration
ORACLE_USER=psikotakip_user
ORACLE_PASSWORD=YourSecurePassword123!
ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1

# Connection Pool Settings
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1
ORACLE_POOL_TIMEOUT=60

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:9002

# AI Configuration (Keep existing Genkit settings)
GOOGLE_GENAI_API_KEY=your-google-ai-api-key
```

### Step 3: Database Connection Test

Test your database connection:

```bash
npm run db:test
```

Or manually test with Node.js:

```javascript
// test-db.js
const oracledb = require('oracledb');

async function testConnection() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'psikotakip_user',
      password: 'YourSecurePassword123!',
      connectString: 'localhost:1521/XEPDB1'
    });
    
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('✓ Database connection successful!');
    console.log('Result:', result.rows);
  } catch (err) {
    console.error('✗ Database connection failed:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

testConnection();
```

Run the test:

```bash
node test-db.js
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:9002

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Network Configuration

### Local Network Access

To make the application accessible on your local network:

1. Find your local IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update Next.js dev server to listen on all interfaces:
   ```bash
   # In package.json, modify dev script:
   "dev": "next dev --turbopack -p 9002 -H 0.0.0.0"
   ```

3. Access from other devices:
   ```
   http://YOUR_LOCAL_IP:9002
   ```

### Firewall Configuration

#### Linux (UFW)
```bash
sudo ufw allow 9002/tcp
sudo ufw allow 1521/tcp  # Oracle DB port
```

#### Windows Firewall
```powershell
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Psikotakip App" -Direction Inbound -LocalPort 9002 -Protocol TCP -Action Allow

# Allow Oracle DB
New-NetFirewallRule -DisplayName "Oracle DB" -Direction Inbound -LocalPort 1521 -Protocol TCP -Action Allow
```

## Security Best Practices

### 1. Database Security

- **Change Default Passwords**: Always use strong passwords for database users
- **Use Encrypted Connections**: Configure Oracle SSL/TLS for encrypted connections
- **Implement IP Whitelisting**: Restrict database access to trusted IP addresses
- **Regular Backups**: Schedule automated database backups

```sql
-- Enable SSL in Oracle listener.ora
LISTENER=
  (DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCPS)(HOST=localhost)(PORT=2484))
  )

SSL_CLIENT_AUTHENTICATION=FALSE
WALLET_LOCATION=
  (SOURCE=(METHOD=FILE)(METHOD_DATA=(DIRECTORY=/path/to/wallet)))
```

### 2. Application Security

- **Environment Variables**: Never commit `.env` files to version control
- **JWT Secrets**: Use strong, random secrets (minimum 32 characters)
- **HTTPS**: Use HTTPS in production with valid SSL certificates
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **Input Validation**: Always validate and sanitize user inputs
- **SQL Injection Prevention**: Use parameterized queries (already implemented)

### 3. HIPAA/KVKK Compliance

- **Audit Logging**: All patient data access is logged in the `audit_log` table
- **Data Encryption**: Encrypt sensitive data at rest
- **Access Controls**: Role-based access control (RBAC) is implemented
- **Data Retention**: Implement data retention policies
- **Backup Encryption**: Encrypt database backups

```sql
-- Enable Transparent Data Encryption (TDE) in Oracle
ALTER SYSTEM SET ENCRYPTION KEY IDENTIFIED BY "your-key";
ALTER TABLESPACE users ENCRYPTION ONLINE ENCRYPT;
```

## Monitoring and Maintenance

### Database Monitoring

```sql
-- Check active sessions
SELECT username, status, COUNT(*) 
FROM v$session 
WHERE username = 'PSIKOTAKIP_USER'
GROUP BY username, status;

-- Check table sizes
SELECT segment_name, bytes/1024/1024 as MB
FROM user_segments
WHERE segment_type = 'TABLE'
ORDER BY bytes DESC;

-- Check connection pool statistics
SELECT * FROM v$resource_limit WHERE resource_name = 'sessions';
```

### Application Monitoring

```bash
# View application logs
npm run dev 2>&1 | tee app.log

# Monitor database connections
# Check src/lib/database/config.ts logs
```

### Backup Strategy

```bash
# Export database (Data Pump)
expdp psikotakip_user/password@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=psikotakip_backup.dmp \
  logfile=psikotakip_backup.log

# Import database
impdp psikotakip_user/password@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=psikotakip_backup.dmp \
  logfile=psikotakip_restore.log
```

### Automated Backups

Create a cron job (Linux) or scheduled task (Windows):

```bash
# Linux cron example (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh

# backup-script.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
expdp psikotakip_user/password@XEPDB1 \
  directory=DATA_PUMP_DIR \
  dumpfile=psikotakip_backup_$DATE.dmp \
  logfile=psikotakip_backup_$DATE.log
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to Oracle database

**Solutions**:
1. Check Oracle service is running:
   ```bash
   # Linux
   sudo systemctl status oracle-xe-21c
   
   # Windows
   services.msc  # Look for OracleServiceXE
   ```

2. Check TNS listener:
   ```bash
   lsnrctl status
   ```

3. Verify connection string:
   ```bash
   sqlplus psikotakip_user/password@localhost:1521/XEPDB1
   ```

### ORA-12154: TNS:could not resolve the connect identifier

**Solution**: Check your `tnsnames.ora` file or use easy connect string format:
```
host:port/service_name
```

### ORA-01017: invalid username/password

**Solution**: Verify credentials and reset if necessary:
```sql
ALTER USER psikotakip_user IDENTIFIED BY "NewPassword123!";
```

### Node.js Module Not Found (oracledb)

**Solution**: Install Oracle Instant Client:

**Linux**:
```bash
# Download from Oracle website
# Extract and set LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/path/to/instantclient_21_x:$LD_LIBRARY_PATH
```

**Windows**:
1. Download Oracle Instant Client
2. Add to system PATH
3. Restart Node.js application

### Performance Issues

**Problem**: Slow database queries

**Solutions**:
1. Check execution plans:
   ```sql
   EXPLAIN PLAN FOR SELECT * FROM users WHERE email = 'test@example.com';
   SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
   ```

2. Update statistics:
   ```sql
   EXEC DBMS_STATS.GATHER_SCHEMA_STATS('PSIKOTAKIP_USER');
   ```

3. Check indexes:
   ```sql
   SELECT index_name, table_name FROM user_indexes;
   ```

## Migration from Firebase

### Data Export from Firebase

1. Export Firestore data using Firebase Admin SDK
2. Transform data to match Oracle schema
3. Import using provided migration scripts

See `docs/MIGRATION_GUIDE.md` for detailed instructions.

## Support

For issues and questions:
- Check documentation in `/docs` directory
- Review database logs: `$ORACLE_HOME/diag/rdbms/xe/XE/trace/`
- Review application logs
- Check GitHub issues

## Additional Resources

- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [node-oracledb Documentation](https://oracle.github.io/node-oracledb/)
- [Next.js Documentation](https://nextjs.org/docs)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/)
- [KVKK (Turkish GDPR) Guide](https://www.kvkk.gov.tr/)
