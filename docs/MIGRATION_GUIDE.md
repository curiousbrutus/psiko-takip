# Migration Guide: Firebase to Local Oracle Database

This guide helps you migrate from the Firebase-based setup to the local Oracle database setup.

## Overview

### What Changes

**Before (Firebase):**
- Firebase Authentication for user management
- Firestore for data storage
- Firebase Cloud Functions for backend logic
- Real-time listeners for live updates

**After (Local Oracle):**
- JWT authentication with local user database
- Oracle database with relational schema
- Next.js API routes for backend logic
- Polling or Server-Sent Events for updates

## Migration Steps

### Step 1: Export Data from Firebase

#### 1.1 Install Firebase Admin SDK

```bash
npm install firebase-admin --save-dev
```

#### 1.2 Create Export Script

Create `scripts/export-firebase.js`:

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to ISO strings
      _meta: {
        createdAt: doc.createTime?.toDate().toISOString(),
        updatedAt: doc.updateTime?.toDate().toISOString()
      }
    });
  });
  
  return data;
}

async function exportAllData() {
  const collections = [
    'users',
    'gamification',
    'moodEntries',
    'journalEntries',
    'testSubmissions',
    'assessmentTasks',
    'assessmentResults',
    'collaborativeTasks',
    'appointments',
    'chatMessages'
  ];
  
  const exportData = {};
  
  for (const collection of collections) {
    console.log(`Exporting ${collection}...`);
    exportData[collection] = await exportCollection(collection);
    console.log(`Exported ${exportData[collection].length} documents`);
  }
  
  // Save to file
  fs.writeFileSync(
    'firebase-export.json',
    JSON.stringify(exportData, null, 2)
  );
  
  console.log('Export complete! Data saved to firebase-export.json');
}

exportAllData().catch(console.error);
```

#### 1.3 Run Export

```bash
node scripts/export-firebase.js
```

### Step 2: Transform Data for Oracle

#### 2.1 Create Transformation Script

Create `scripts/transform-data.js`:

```javascript
const fs = require('fs');

function transformTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }
  return new Date(timestamp).toISOString();
}

function transformUsers(users) {
  return users.map(user => ({
    user_id: user.id,
    email: user.email || '',
    // Note: Passwords need to be reset as we can't export them from Firebase
    display_name: user.displayName || '',
    role: user.role || 'danisan',
    connected_therapist_id: user.connectedTherapist || null,
    phone: user.phone || null,
    status: 'active',
    created_at: transformTimestamp(user._meta?.createdAt),
  }));
}

function transformGamification(gamificationData) {
  return gamificationData.map(g => ({
    user_id: g.id,
    xp: g.xp || 0,
    level: g.level || 1,
    current_streak: g.currentStreak || 0,
    longest_streak: g.longestStreak || 0,
    companion_type: g.companion?.type || null,
    companion_created_at: g.companion?.createdAt ? transformTimestamp(g.companion.createdAt) : null,
    last_activity_date: transformTimestamp(g.lastActivityDate),
    total_tasks_completed: g.totalTasksCompleted || 0,
  }));
}

function transformMoodEntries(moods) {
  return moods.map(m => ({
    entry_id: m.id,
    user_id: m.userId,
    mood: m.mood,
    period: m.period,
    intensity: m.intensity || null,
    notes: m.notes || null,
    created_at: transformTimestamp(m.createdAt),
  }));
}

function transformJournalEntries(journals) {
  return journals.map(j => ({
    entry_id: j.id,
    user_id: j.userId,
    content: j.content,
    prompt: j.prompt || null,
    entry_type: j.entryType || null,
    is_shared: j.isShared ? 1 : 0,
    created_at: transformTimestamp(j.createdAt),
  }));
}

// Load Firebase export
const firebaseData = JSON.parse(fs.readFileSync('firebase-export.json', 'utf8'));

// Transform data
const oracleData = {
  users: transformUsers(firebaseData.users || []),
  gamification: transformGamification(firebaseData.gamification || []),
  moodEntries: transformMoodEntries(firebaseData.moodEntries || []),
  journalEntries: transformJournalEntries(firebaseData.journalEntries || []),
  // Add more transformations as needed
};

// Save transformed data
fs.writeFileSync(
  'oracle-import.json',
  JSON.stringify(oracleData, null, 2)
);

console.log('Transformation complete! Data saved to oracle-import.json');
```

#### 2.2 Run Transformation

```bash
node scripts/transform-data.js
```

### Step 3: Import Data to Oracle

#### 3.1 Create Import Script

Create `scripts/import-to-oracle.js`:

```javascript
const oracledb = require('oracledb');
const fs = require('fs');

async function importData() {
  let connection;
  
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });
    
    const data = JSON.parse(fs.readFileSync('oracle-import.json', 'utf8'));
    
    // Import users (skip passwords - users will need to reset)
    for (const user of data.users) {
      await connection.execute(
        `INSERT INTO users (user_id, email, password_hash, display_name, role, 
                           connected_therapist_id, phone, status, created_at)
         VALUES (:user_id, :email, 'RESET_REQUIRED', :display_name, :role,
                 :connected_therapist_id, :phone, :status, 
                 TO_TIMESTAMP(:created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'))`,
        user,
        { autoCommit: false }
      );
    }
    
    // Import gamification
    for (const g of data.gamification) {
      await connection.execute(
        `INSERT INTO gamification (user_id, xp, level, current_streak, longest_streak,
                                   companion_type, companion_created_at, last_activity_date,
                                   total_tasks_completed)
         VALUES (:user_id, :xp, :level, :current_streak, :longest_streak,
                 :companion_type, 
                 TO_TIMESTAMP(:companion_created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
                 TO_TIMESTAMP(:last_activity_date, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
                 :total_tasks_completed)`,
        g,
        { autoCommit: false }
      );
    }
    
    // Import mood entries
    for (const m of data.moodEntries) {
      await connection.execute(
        `INSERT INTO mood_entries (entry_id, user_id, mood, period, intensity, notes, created_at)
         VALUES (:entry_id, :user_id, :mood, :period, :intensity, :notes,
                 TO_TIMESTAMP(:created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'))`,
        m,
        { autoCommit: false }
      );
    }
    
    // Import journal entries
    for (const j of data.journalEntries) {
      await connection.execute(
        `INSERT INTO journal_entries (entry_id, user_id, content, prompt, entry_type, 
                                      is_shared, created_at)
         VALUES (:entry_id, :user_id, :content, :prompt, :entry_type, :is_shared,
                 TO_TIMESTAMP(:created_at, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'))`,
        j,
        { autoCommit: false }
      );
    }
    
    await connection.commit();
    console.log('Import complete!');
    
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Import error:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

importData();
```

#### 3.2 Run Import

```bash
node scripts/import-to-oracle.js
```

### Step 4: Update Application Code

#### 4.1 Replace Firebase Auth Calls

**Before:**
```typescript
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

**After:**
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { user, accessToken } = await response.json();
localStorage.setItem('accessToken', accessToken);
```

#### 4.2 Replace Firestore Queries

**Before:**
```typescript
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(collection(db, 'moodEntries'), where('userId', '==', userId));
const querySnapshot = await getDocs(q);
const moods = querySnapshot.docs.map(doc => doc.data());
```

**After:**
```typescript
const response = await fetch('/api/moods', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

const moods = await response.json();
```

#### 4.3 Replace Real-time Listeners

**Before:**
```typescript
import { onSnapshot, doc } from 'firebase/firestore';

const unsubscribe = onSnapshot(doc(db, 'gamification', userId), (doc) => {
  setGamificationData(doc.data());
});
```

**After (Polling):**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/gamification/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setGamificationData(await response.json());
  };
  
  fetchData();
  const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}, [token]);
```

### Step 5: Handle Password Resets

Since Firebase passwords cannot be exported, all users will need to reset their passwords.

#### 5.1 Create Password Reset Flow

```typescript
// POST /api/auth/request-reset
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  // Generate reset token
  // Send email with reset link
  // Save token to database
}

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();
  
  // Verify token
  // Update password
  // Invalidate token
}
```

#### 5.2 Notify Users

Send email to all users:

```
Subject: Password Reset Required

Dear User,

We've upgraded our system to provide better security and performance. 
As part of this upgrade, you'll need to reset your password.

Please visit: https://your-app.com/reset-password

Thank you for your understanding.
```

### Step 6: Testing

#### 6.1 Test Checklist

- [ ] User registration works
- [ ] User login works
- [ ] JWT token refresh works
- [ ] All user roles work correctly
- [ ] Mood entries can be created and retrieved
- [ ] Journal entries can be created and shared
- [ ] Tests can be submitted and analyzed
- [ ] Gamification XP and levels update correctly
- [ ] Therapist can see client data
- [ ] Appointments can be created and managed
- [ ] Chat functionality works
- [ ] All API endpoints return correct data
- [ ] Error handling works properly
- [ ] Performance is acceptable

#### 6.2 Run Tests

```bash
npm run test
npm run test:coverage
```

### Step 7: Deployment

#### 7.1 Production Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
export ORACLE_CONNECTION_STRING=your-prod-connection
export JWT_SECRET=your-prod-secret
```

#### 7.2 Build and Deploy

```bash
npm run build
npm start
```

#### 7.3 Setup Reverse Proxy (Optional)

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name psikotakip.example.com;
    
    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Rollback Plan

If migration encounters issues:

1. Keep Firebase project active during migration
2. Run both systems in parallel initially
3. Gradually migrate users
4. Monitor for issues
5. Have Firebase backup ready for rollback

### Gradual Migration Strategy

```javascript
// Feature flag for gradual rollout
const USE_ORACLE = process.env.USE_ORACLE_DB === 'true';

async function getUserData(userId) {
  if (USE_ORACLE) {
    return await fetchFromOracle(userId);
  } else {
    return await fetchFromFirebase(userId);
  }
}
```

## Common Issues and Solutions

### Issue: Users can't log in

**Solution**: Ensure passwords have been reset. Check JWT configuration.

### Issue: Data not appearing

**Solution**: Verify import script completed successfully. Check database constraints.

### Issue: Performance slow

**Solution**: Add database indexes. Check connection pool settings. Optimize queries.

### Issue: Real-time updates not working

**Solution**: Implement polling or SSE. Consider WebSocket for true real-time.

## Support

If you encounter issues during migration:
1. Check logs: `$ORACLE_HOME/diag/rdbms/`
2. Review application logs
3. Open GitHub issue with details
4. Contact support: support@psikotakip.com

## Backup Strategy

Before starting migration:

```bash
# Backup Firebase
firebase-tools backup

# Backup Oracle (after import)
expdp psikotakip_user/password directory=DATA_PUMP_DIR dumpfile=pre-migration.dmp
```

Keep backups for at least 30 days after successful migration.
