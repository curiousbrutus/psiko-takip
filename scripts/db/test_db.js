// Quick Oracle connectivity test
require('dotenv').config();
const oracledb = require('oracledb');

async function test() {
  console.log('Testing Oracle connection...');
  console.log('User:', process.env.ORACLE_USER);
  console.log('Connection String:', process.env.ORACLE_CONNECTION_STRING);

  try {
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    });

    console.log('Connected successfully!');

    const result = await connection.execute('SELECT 1 as test_val FROM DUAL');
    console.log('Query result:', result.rows);

    const tables = await connection.execute(
      "SELECT table_name FROM user_tables WHERE table_name = 'USERS'"
    );
    console.log('Users table exists:', tables.rows && tables.rows.length > 0);

    await connection.close();
    console.log('Connection closed. Test PASSED!');
  } catch (err) {
    console.error('Connection FAILED:', err.message);
    process.exit(1);
  }
}

test();
