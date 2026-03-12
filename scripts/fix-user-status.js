/**
 * Fix Test User Status Script
 * Sets all test users to 'active' status
 */

const oracledb = require('oracledb');

async function fixUserStatus() {
  let connection;

  try {
    const config = {
      user: process.env.ORACLE_USER || 'FTH',
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING || 'BYZDB',
    };

    console.log('🔄 Connecting to database...');
    connection = await oracledb.getConnection(config);

    // Update user status
    const updateResult = await connection.execute(
      `UPDATE psk_ebg_users 
       SET status = 'active' 
       WHERE email LIKE '%@test.psikotakip.com'`,
      [],
      { autoCommit: true }
    );

    console.log(`✅ Updated ${updateResult.rowsAffected} user(s) to active status\n`);

    // Verify the changes
    const result = await connection.execute(
      `SELECT user_id, email, display_name, role, status 
       FROM psk_ebg_users 
       WHERE email LIKE '%@test.psikotakip.com'
       ORDER BY role, user_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log('📋 Updated Test Users:\n');
    console.log('═══════════════════════════════════════════════════════');
    
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach((user) => {
        const statusIcon = user.STATUS === 'active' ? '✅' : '❌';
        console.log(`\n${statusIcon} ${user.ROLE.toUpperCase()}`);
        console.log(`   Email:  ${user.EMAIL}`);
        console.log(`   Name:   ${user.DISPLAY_NAME}`);
        console.log(`   Status: ${user.STATUS}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ All test users are now active!');
    console.log('🌐 You can login at: http://localhost:9002/login\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
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

fixUserStatus().catch(console.error);
