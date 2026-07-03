// Migration: client invitations + client_status column
// Idempotent — safe to run multiple times.
require('dotenv').config();
const oracledb = require('oracledb');

const statements = [
  {
    label: 'CREATE TABLE psk_ebg_client_invitations',
    sql: `CREATE TABLE psk_ebg_client_invitations (
      invitation_id VARCHAR2(128) PRIMARY KEY,
      therapist_id  VARCHAR2(128) NOT NULL,
      email         VARCHAR2(255) NOT NULL,
      full_name     VARCHAR2(255),
      phone         VARCHAR2(20),
      status        VARCHAR2(20) DEFAULT 'invited' CHECK (status IN ('invited','accepted','cancelled')),
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      accepted_at   TIMESTAMP,
      CONSTRAINT fk_invitation_therapist FOREIGN KEY (therapist_id)
        REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
    )`,
    ignore: [955], // ORA-00955: name is already used by an existing object
  },
  {
    label: 'CREATE UNIQUE INDEX idx_psk_inv_ther_email',
    sql: `CREATE UNIQUE INDEX idx_psk_inv_ther_email
          ON psk_ebg_client_invitations(therapist_id, LOWER(email))`,
    ignore: [955, 1408], // 1408: such column list already indexed
  },
  {
    label: 'CREATE INDEX idx_psk_inv_email',
    sql: `CREATE INDEX idx_psk_inv_email
          ON psk_ebg_client_invitations(LOWER(email))`,
    ignore: [955, 1408],
  },
  {
    label: 'ALTER TABLE psk_ebg_users ADD client_status',
    sql: `ALTER TABLE psk_ebg_users ADD (client_status VARCHAR2(20))`,
    ignore: [1430], // ORA-01430: column being added already exists in table
  },
];

async function run() {
  const connection = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
  });
  console.log('Connected. Applying migration...');

  for (const stmt of statements) {
    try {
      await connection.execute(stmt.sql);
      console.log(`  OK   ${stmt.label}`);
    } catch (err) {
      const code = err.errorNum || (err.message.match(/ORA-(\d+)/) ? Number(RegExp.$1) : 0);
      if (stmt.ignore.includes(code)) {
        console.log(`  SKIP ${stmt.label} (already applied, ORA-${code})`);
      } else {
        console.error(`  FAIL ${stmt.label}:`, err.message);
        await connection.close();
        process.exit(1);
      }
    }
  }

  await connection.commit();
  await connection.close();
  console.log('Migration complete.');
}

run().catch((err) => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
