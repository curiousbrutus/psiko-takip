# Psikotakip - Complete Setup Checklist

This checklist will guide you through the complete setup of Psikotakip on your local server with Oracle database.

## Prerequisites Checklist

- [ ] Oracle Database 19c or later installed
- [ ] Node.js 20 or later installed
- [ ] Git installed
- [ ] Oracle Instant Client installed (for node-oracledb)
- [ ] At least 8GB RAM available
- [ ] At least 20GB disk space available
- [ ] Network access configured (if deploying to local network)

## Phase 1: Database Setup

### 1.1 Oracle Installation
- [ ] Download Oracle Database XE 21c
- [ ] Install Oracle Database
- [ ] Verify Oracle service is running
  ```bash
  # Linux
  sudo systemctl status oracle-xe-21c
  
  # Windows
  services.msc  # Check OracleServiceXE
  ```

### 1.2 Create Application User
- [ ] Connect as SYSTEM user
  ```bash
  sqlplus system/password@localhost:1521/XEPDB1
  ```
- [ ] Run the following SQL:
  ```sql
  CREATE USER psikotakip_user IDENTIFIED BY "YourSecurePassword123!";
  GRANT CONNECT, RESOURCE TO psikotakip_user;
  GRANT CREATE SESSION TO psikotakip_user;
  GRANT CREATE TABLE TO psikotakip_user;
  GRANT CREATE VIEW TO psikotakip_user;
  GRANT CREATE SEQUENCE TO psikotakip_user;
  GRANT CREATE TRIGGER TO psikotakip_user;
  GRANT CREATE PROCEDURE TO psikotakip_user;
  GRANT UNLIMITED TABLESPACE TO psikotakip_user;
  EXIT;
  ```
- [ ] Verify user creation
  ```sql
  SELECT username FROM dba_users WHERE username = 'PSIKOTAKIP_USER';
  ```

### 1.3 Create Schema
- [ ] Connect as application user
  ```bash
  sqlplus psikotakip_user/YourSecurePassword123!@localhost:1521/XEPDB1
  ```
- [ ] Run schema creation script
  ```sql
  @database/schema.sql
  ```
- [ ] Verify tables created
  ```sql
  SELECT table_name FROM user_tables;
  ```
- [ ] Expected tables: users, user_sessions, gamification, mood_entries, journal_entries, test_submissions, assessment_tasks, assessment_results, collaborative_tasks, appointments, chat_messages, audit_log, system_config

### 1.4 Create Stored Procedures
- [ ] Run user management procedures
  ```sql
  @database/procedures/user_management.sql
  ```
- [ ] Run gamification procedures
  ```sql
  @database/procedures/gamification.sql
  ```
- [ ] Verify procedures created
  ```sql
  SELECT object_name, object_type FROM user_objects WHERE object_type = 'PROCEDURE';
  ```

### 1.5 Test Database Connection
- [ ] Test connection from command line
  ```bash
  sqlplus psikotakip_user/password@localhost:1521/XEPDB1
  SELECT 1 FROM DUAL;
  EXIT;
  ```

## Phase 2: Application Setup

### 2.1 Clone Repository
- [ ] Clone the repository
  ```bash
  git clone https://github.com/curiousbrutus/psiko-takip-firebase.git
  cd psiko-takip-firebase
  ```

### 2.2 Install Dependencies
- [ ] Install Node.js dependencies
  ```bash
  npm install
  ```
- [ ] Verify installation
  ```bash
  npm list oracledb bcryptjs jsonwebtoken
  ```

### 2.3 Configure Environment
- [ ] Copy environment template
  ```bash
  cp .env.example .env.local
  ```
- [ ] Edit `.env.local` with your values:
  - [ ] `ORACLE_USER=psikotakip_user`
  - [ ] `ORACLE_PASSWORD=YourSecurePassword123!`
  - [ ] `ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1`
  - [ ] Generate JWT_SECRET (32+ chars)
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - [ ] Generate JWT_REFRESH_SECRET (32+ chars)
  - [ ] Add GOOGLE_GENAI_API_KEY (optional, for AI features)

### 2.4 Test Database Connection from App
- [ ] Create test file `test-db.js`:
  ```javascript
  require('dotenv').config({ path: '.env.local' });
  const oracledb = require('oracledb');
  
  async function test() {
    let connection;
    try {
      connection = await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECTION_STRING
      });
      
      const result = await connection.execute('SELECT 1 as test FROM DUAL');
      console.log('✓ Database connection successful!');
      console.log('Result:', result.rows);
    } catch (err) {
      console.error('✗ Connection failed:', err);
    } finally {
      if (connection) await connection.close();
    }
  }
  
  test();
  ```
- [ ] Run test: `node test-db.js`
- [ ] Verify "Database connection successful!" message

### 2.5 Start Development Server
- [ ] Start the application
  ```bash
  npm run dev
  ```
- [ ] Verify server starts on port 9002
- [ ] Check console for "Oracle connection pool created successfully"

### 2.6 Test Health Endpoint
- [ ] Open browser to http://localhost:9002/api/health
- [ ] Verify response shows:
  ```json
  {
    "status": "healthy",
    "database": {
      "connected": true
    }
  }
  ```

## Phase 3: Basic Functionality Testing

### 3.1 Test User Registration
- [ ] Use curl or Postman:
  ```bash
  curl -X POST http://localhost:9002/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "TestPassword123",
      "displayName": "Test User",
      "role": "danisan"
    }'
  ```
- [ ] Verify response contains userId, accessToken, refreshToken
- [ ] Save accessToken for next tests

### 3.2 Test User Login
- [ ] Login with created user:
  ```bash
  curl -X POST http://localhost:9002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "TestPassword123"
    }'
  ```
- [ ] Verify successful login with tokens returned

### 3.3 Test Authenticated Endpoint
- [ ] Test protected endpoint (replace YOUR_TOKEN):
  ```bash
  curl -X GET http://localhost:9002/api/health \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```
- [ ] Verify access granted

### 3.4 Verify Database Entries
- [ ] Check user was created in database:
  ```sql
  SELECT user_id, email, display_name, role FROM users;
  ```
- [ ] Check gamification was initialized:
  ```sql
  SELECT * FROM gamification WHERE user_id = (SELECT user_id FROM users WHERE email = 'test@example.com');
  ```

## Phase 4: Network Configuration (Optional)

### 4.1 Enable Network Access
- [ ] Modify package.json dev script:
  ```json
  "dev": "next dev --turbopack -p 9002 -H 0.0.0.0"
  ```

### 4.2 Find Local IP
- [ ] Get your local IP address:
  ```bash
  # Linux/Mac
  ifconfig | grep "inet "
  
  # Windows
  ipconfig
  ```
- [ ] Note your IP address (e.g., 192.168.1.100)

### 4.3 Configure Firewall
**Linux (UFW):**
- [ ] Allow application port:
  ```bash
  sudo ufw allow 9002/tcp
  ```
- [ ] Allow Oracle port (if accessing from network):
  ```bash
  sudo ufw allow 1521/tcp
  ```

**Windows:**
- [ ] Open Windows Defender Firewall
- [ ] Create inbound rule for port 9002
- [ ] Create inbound rule for port 1521 (if needed)

### 4.4 Test Network Access
- [ ] From another device on network, access:
  ```
  http://YOUR_LOCAL_IP:9002
  ```
- [ ] Verify application loads

## Phase 5: Docker Deployment (Alternative)

### 5.1 Docker Prerequisites
- [ ] Install Docker Engine
- [ ] Install Docker Compose
- [ ] Login to Oracle Container Registry:
  ```bash
  docker login container-registry.oracle.com
  ```

### 5.2 Configure Docker Environment
- [ ] Copy .env.example to .env.local
- [ ] Add GOOGLE_GENAI_API_KEY to .env.local

### 5.3 Start Docker Services
- [ ] Start all services:
  ```bash
  docker-compose up -d
  ```
- [ ] Wait for Oracle to be ready (2-3 minutes)
- [ ] Check logs:
  ```bash
  docker-compose logs -f oracle-db
  ```

### 5.4 Initialize Docker Database
- [ ] Access Oracle container:
  ```bash
  docker exec -it psikotakip-oracle sqlplus system/OraclePassword123@XEPDB1
  ```
- [ ] Run initialization scripts
- [ ] Exit and restart app container:
  ```bash
  docker-compose restart app
  ```

### 5.5 Verify Docker Deployment
- [ ] Access http://localhost:9002
- [ ] Test health endpoint
- [ ] Test user registration

## Phase 6: Production Checklist

### 6.1 Security Hardening
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates

### 6.2 Performance Optimization
- [ ] Configure Oracle connection pool:
  - [ ] ORACLE_POOL_MIN=5
  - [ ] ORACLE_POOL_MAX=20
- [ ] Enable database query optimization
- [ ] Set up database indexes
- [ ] Configure caching (if needed)

### 6.3 Backup Strategy
- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Configure backup retention policy
- [ ] Document backup procedures

### 6.4 Monitoring
- [ ] Set up application logging
- [ ] Configure database monitoring
- [ ] Set up error tracking
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical issues

### 6.5 Documentation
- [ ] Document server configuration
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures
- [ ] Create user guide
- [ ] Document API endpoints

## Phase 7: Migration from Firebase (If Applicable)

- [ ] Export data from Firebase
- [ ] Transform data for Oracle
- [ ] Import data to Oracle
- [ ] Notify users about password reset
- [ ] Test migrated data
- [ ] Verify all functionality works
- [ ] Decommission Firebase project

## Troubleshooting Checklist

### Database Connection Issues
- [ ] Oracle service is running
- [ ] TNS listener is running
- [ ] Connection string is correct
- [ ] User has proper permissions
- [ ] Firewall allows connection
- [ ] Network connectivity is working

### Application Issues
- [ ] All dependencies are installed
- [ ] Environment variables are set
- [ ] Port 9002 is available
- [ ] Node.js version is 20+
- [ ] Oracle Instant Client is installed

### Docker Issues
- [ ] Docker service is running
- [ ] Sufficient disk space
- [ ] Sufficient memory (4GB+)
- [ ] Ports are not in use
- [ ] Images pulled successfully

## Final Verification

- [ ] Application starts without errors
- [ ] Database connection is established
- [ ] Health endpoint returns "healthy"
- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Protected endpoints are accessible with token
- [ ] Protected endpoints reject requests without token
- [ ] Data is persisting in database
- [ ] Application is accessible from network (if configured)
- [ ] All critical features are working

## Post-Setup Tasks

- [ ] Create admin user account
- [ ] Create test therapist account
- [ ] Create test client account
- [ ] Test therapist-client connection
- [ ] Test all major features
- [ ] Set up monitoring and alerts
- [ ] Schedule regular backups
- [ ] Document any custom configuration
- [ ] Train users on new system

## Support Resources

- **Documentation**: `/docs` directory
- **Database Setup**: `docs/DATABASE_SETUP.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Migration Guide**: `docs/MIGRATION_GUIDE.md`
- **Docker Guide**: `docs/DOCKER_DEPLOYMENT.md`
- **GitHub Issues**: https://github.com/curiousbrutus/psiko-takip-firebase/issues

## Notes

Date completed: _______________

Issues encountered: 
_________________________________
_________________________________
_________________________________

Custom configuration:
_________________________________
_________________________________
_________________________________

Next steps:
_________________________________
_________________________________
_________________________________
