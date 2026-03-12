require('dotenv').config();
const oracledb = require('oracledb');
oracledb.autoCommit = true;

async function run() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });

    // Create the missing gratitude_entries table with PSK_EBG prefix
    try {
      await conn.execute(`CREATE TABLE psk_ebg_gratitude_entries (
        entry_id VARCHAR2(128) PRIMARY KEY,
        user_id VARCHAR2(128) NOT NULL,
        content CLOB NOT NULL,
        category VARCHAR2(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_gratitude_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
      )`);
      console.log('Created psk_ebg_gratitude_entries table successfully');
    } catch(e) {
      if (e.errorNum === 955) {
        console.log('psk_ebg_gratitude_entries table already exists - skipping');
      } else {
        throw e;
      }
    }

    // Show all PSK_EBG_ tables that exist
    const res = await conn.execute(
      "SELECT table_name FROM user_tables WHERE table_name LIKE 'PSK_EBG_%' ORDER BY table_name",
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('\nAll PSK_EBG_ tables in Oracle:');
    res.rows.forEach(r => console.log(' -', r.TABLE_NAME));

  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    if (conn) await conn.close();
  }
}

run();
