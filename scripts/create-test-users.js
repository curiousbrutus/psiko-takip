/**
 * Create Test Users Script
 * Run this to create test users with the registration API
 */

const BASE_URL = 'http://localhost:9002';

const testUsers = [
  {
    email: 'admin@test.psikotakip.com',
    password: 'Test123!',
    displayName: 'Test Admin',
    role: 'kurum_yoneticisi'
  },
  {
    email: 'therapist@test.psikotakip.com',
    password: 'Test123!',
    displayName: 'Dr. Test Terapist',
    role: 'terapist'
  },
  {
    email: 'client@test.psikotakip.com',
    password: 'Test123!',
    displayName: 'Test Danışan',
    role: 'danisan'
  },
  {
    email: 'client2@test.psikotakip.com',
    password: 'Test123!',
    displayName: 'Test Danışan 2',
    role: 'danisan'
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  for (const user of testUsers) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Created ${user.role}: ${user.email}`);
      } else {
        console.log(`⚠️  ${user.email}: ${data.error || 'Already exists or error'}`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message);
    }
  }

  console.log('\n📋 Test User Credentials:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n👨‍💼 ADMIN (kurum_yoneticisi):');
  console.log('   Email:    admin@test.psikotakip.com');
  console.log('   Password: Test123!');
  console.log('\n👨‍⚕️  THERAPIST (terapist):');
  console.log('   Email:    therapist@test.psikotakip.com');
  console.log('   Password: Test123!');
  console.log('\n👤 CLIENT 1 (danisan):');
  console.log('   Email:    client@test.psikotakip.com');
  console.log('   Password: Test123!');
  console.log('\n👤 CLIENT 2 (danisan):');
  console.log('   Email:    client2@test.psikotakip.com');
  console.log('   Password: Test123!');
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('\n🌐 Login at: http://localhost:9002/login\n');
}

// Run the script
createTestUsers().catch(console.error);
