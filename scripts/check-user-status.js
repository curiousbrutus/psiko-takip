/**
 * Check User Status Script
 */

const oracledb = require('oracledb');

async function checkUserStatus() {
  let connection;

  try {
    // Get connection details from environment or use defaults
    const config = {
      user: process.env.ORACLE_USER || 'FTH',
      password: process.env.ORACLE_PASSWORD || 'your_password',
      connectString: process.env.ORACLE_CONNECTION_STRING || 'BYZDB',
    };

    console.log('Connecting to database...');
    connection = await oracledb.getConnection(config);

    const result = await connection.execute(
      `SELECT user_id, email, display_name, role, status, created_at 
       FROM psk_ebg_users 
       WHERE email LIKE '%@test.psikotakip.com'
       ORDER BY user_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log('\n📋 Test User Status:\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach((user) => {
        console.log(`\nUser ID:      ${user.USER_ID}`);
        console.log(`Email:        ${user.EMAIL}`);
        console.log(`Display Name: ${user.DISPLAY_NAME}`);
        console.log(`Role:         ${user.ROLE}`);
        console.log(`Status:       ${user.STATUS} ${user.STATUS === 'active' ? '✓' : '❌'}`);
        console.log(`Created:      ${user.CREATED_AT}`);
        console.log('─────────────────────────────────────────────────────────────────');
      });
    } else {
      console.log('No test users found.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

checkUserStatus().catch(console.error);
