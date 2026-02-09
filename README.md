# Psikotakip - Mental Health Tracking Platform

Psikotakip is a comprehensive mental health tracking application designed for mental health professionals, patients, and institutional workers. The application provides tools for therapy management, patient progress tracking, gamification, and AI-powered therapeutic assistance.

## 🌟 Features

- **User Management**: Role-based access control for clients (patients), therapists, and administrators
- **Authentication**: Secure JWT-based authentication with refresh tokens
- **Gamification**: XP system, levels, streaks, and virtual companions to motivate engagement
- **Mood Tracking**: Daily mood entries with morning and evening check-ins
- **Journal Entries**: Private and shared journal entries with therapist visibility options
- **Assessments**: Standardized psychological tests (Beck, GAD-7, PHQ-9, etc.)
- **Therapeutic Chat**: AI-powered therapeutic assistant using Google Gemini
- **Appointments**: Scheduling and management of therapy sessions
- **Collaborative Tasks**: Interactive CBT exercises between therapist and client
- **Analytics**: Progress tracking and visualization of mental health metrics
- **HIPAA/KVKK Compliant**: Full audit logging and data protection

## 🏗️ Architecture

### Current Setup: Local Oracle Database

This version uses a local Oracle database instead of Firebase, designed for:
- **Local Server Deployment**: Run on your own infrastructure
- **Oracle Database**: PL/SQL stored procedures and triggers
- **JWT Authentication**: Secure token-based authentication
- **REST API**: Next.js API routes for all operations
- **Network Access**: Accessible from local network devices

### Technology Stack

- **Frontend**: Next.js 15.3, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Oracle Database (19c or later)
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **AI**: Google Gemini via Genkit
- **UI**: Radix UI, Tailwind CSS, shadcn/ui
- **Data Visualization**: Recharts
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

Before setting up the application, ensure you have:

1. **Oracle Database** (19c, 21c XE, or later)
2. **Node.js** (version 20 or later)
3. **npm** or **yarn** package manager
4. **Oracle Instant Client** (for node-oracledb)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/curiousbrutus/psiko-takip-firebase.git
cd psiko-takip-firebase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Oracle Database

Follow the detailed guide in [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md):

```bash
# Connect to Oracle as SYSTEM user
sqlplus system/password@localhost:1521/XEPDB1

# Create application user
@database/schema.sql

# Run stored procedures
@database/procedures/user_management.sql
@database/procedures/gamification.sql
```

### 4. Configure Environment

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database Configuration
ORACLE_USER=psikotakip_user
ORACLE_PASSWORD=your_secure_password
ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1

# JWT Configuration
JWT_SECRET=your-32-char-secret-key
JWT_REFRESH_SECRET=your-32-char-refresh-key

# Google AI (optional)
GOOGLE_GENAI_API_KEY=your_google_ai_key
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at `http://localhost:9002`

## 🌐 Network Configuration

### Local Network Access

To access from other devices on your network:

```bash
# Edit package.json dev script:
"dev": "next dev --turbopack -p 9002 -H 0.0.0.0"
```

Find your local IP:
```bash
# Linux/Mac
ifconfig | grep "inet "

# Windows
ipconfig
```

Access from: `http://YOUR_LOCAL_IP:9002`

### Firewall Configuration

**Linux (UFW):**
```bash
sudo ufw allow 9002/tcp
sudo ufw allow 1521/tcp
```

**Windows:**
```powershell
New-NetFirewallRule -DisplayName "Psikotakip" -Direction Inbound -LocalPort 9002 -Protocol TCP -Action Allow
```

## 📚 Documentation

- **[Database Setup Guide](docs/DATABASE_SETUP.md)** - Complete Oracle database installation and configuration
- **[API Documentation](docs/API_DOCUMENTATION.md)** - REST API endpoints and usage
- **[Technical Documentation](TECHNICAL_DOCUMENTATION.md)** - System architecture and features

## 🔐 Security

### Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Strong Passwords**: Use passwords with minimum 8 characters, including uppercase, lowercase, and numbers
3. **JWT Secrets**: Use cryptographically secure random strings (32+ characters)
4. **HTTPS**: Always use HTTPS in production
5. **Database Security**: Use strong database passwords and restrict network access
6. **Audit Logging**: All patient data access is logged for HIPAA/KVKK compliance

### Generate Secure Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📦 Project Structure

```
psiko-takip-firebase/
├── database/                 # Database schema and migrations
│   ├── schema.sql           # Main database schema
│   ├── procedures/          # Stored procedures
│   ├── migrations/          # Database migrations
│   └── seeds/               # Sample data
├── docs/                    # Documentation
│   ├── DATABASE_SETUP.md
│   └── API_DOCUMENTATION.md
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── (auth)/         # Authentication pages
│   │   └── dashboard/      # Dashboard pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and libraries
│   │   ├── auth/           # Authentication utilities
│   │   ├── database/       # Database repositories
│   │   └── firebase/       # (Legacy - being replaced)
│   ├── hooks/              # React hooks
│   ├── middleware/         # API middleware
│   └── types/              # TypeScript types
├── public/                  # Static assets
├── .env.example            # Environment template
└── package.json
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run typecheck
```

### Database Management

```bash
# Export database
expdp psikotakip_user/password@XEPDB1 directory=DATA_PUMP_DIR dumpfile=backup.dmp

# Import database
impdp psikotakip_user/password@XEPDB1 directory=DATA_PUMP_DIR dumpfile=backup.dmp
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check Oracle service
sudo systemctl status oracle-xe-21c  # Linux
services.msc                          # Windows

# Check listener
lsnrctl status

# Test connection
sqlplus psikotakip_user/password@localhost:1521/XEPDB1
```

### Node.js Module Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Install Oracle Instant Client
# Linux: export LD_LIBRARY_PATH=/path/to/instantclient
# Windows: Add to PATH
```

## 📝 User Roles

- **danisan** (Client/Patient): Can track mood, write journals, take tests, view own data
- **terapist** (Therapist): Can manage clients, assign assessments, view client progress
- **kurum_yoneticisi** (Administrator): Full system access and user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
- GitHub Issues: [https://github.com/curiousbrutus/psiko-takip-firebase/issues](https://github.com/curiousbrutus/psiko-takip-firebase/issues)
- Email: support@psikotakip.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Oracle Database by [Oracle](https://www.oracle.com/database/)
