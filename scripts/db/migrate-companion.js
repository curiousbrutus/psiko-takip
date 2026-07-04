// Migration: Yoldaş (AI companion) config + chat/escalation tables.
// Idempotent — safe to run multiple times.
require('dotenv').config();
const oracledb = require('oracledb');

const statements = [
  {
    label: 'CREATE TABLE psk_ebg_companion_config',
    sql: `CREATE TABLE psk_ebg_companion_config (
      config_id     VARCHAR2(128) PRIMARY KEY,
      therapist_id  VARCHAR2(128) NOT NULL,
      client_id     VARCHAR2(128) NOT NULL,
      approach      VARCHAR2(64),
      tone          VARCHAR2(64),
      goals         CLOB,
      forbidden_topics CLOB,
      treatment_notes  CLOB,
      escalation_sensitivity VARCHAR2(16) DEFAULT 'medium',
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_cc_therapist FOREIGN KEY (therapist_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE,
      CONSTRAINT fk_cc_client    FOREIGN KEY (client_id)    REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
    )`,
    ignore: [955],
  },
  {
    label: 'CREATE UNIQUE INDEX idx_cc_ther_client',
    sql: `CREATE UNIQUE INDEX idx_cc_ther_client
          ON psk_ebg_companion_config(therapist_id, client_id)`,
    ignore: [955, 1408],
  },
  {
    label: 'CREATE TABLE psk_ebg_companion_messages',
    sql: `CREATE TABLE psk_ebg_companion_messages (
      message_id   VARCHAR2(128) PRIMARY KEY,
      client_id    VARCHAR2(128) NOT NULL,
      role         VARCHAR2(16) NOT NULL CHECK (role IN ('user','assistant')),
      content      CLOB NOT NULL,
      flagged      NUMBER(1) DEFAULT 0,
      flag_severity VARCHAR2(16),
      flag_reason  VARCHAR2(255),
      flag_seen    NUMBER(1) DEFAULT 0,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_cm_client FOREIGN KEY (client_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
    )`,
    ignore: [955],
  },
  {
    label: 'CREATE INDEX idx_cm_client_created',
    sql: `CREATE INDEX idx_cm_client_created
          ON psk_ebg_companion_messages(client_id, created_at)`,
    ignore: [955, 1408],
  },
  {
    label: 'CREATE INDEX idx_cm_flagged',
    sql: `CREATE INDEX idx_cm_flagged
          ON psk_ebg_companion_messages(client_id, flagged)`,
    ignore: [955, 1408],
  },
];

async function run() {
  const connection = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
  });
  console.log('Connected. Applying companion migration...');
  for (const stmt of statements) {
    try {
      await connection.execute(stmt.sql);
      console.log(`  OK   ${stmt.label}`);
    } catch (err) {
      const code = err.errorNum || (err.message.match(/ORA-(\d+)/) ? Number(RegExp.$1) : 0);
      if (stmt.ignore.includes(code)) {
        console.log(`  SKIP ${stmt.label} (ORA-${code})`);
      } else {
        console.error(`  FAIL ${stmt.label}:`, err.message);
        await connection.close();
        process.exit(1);
      }
    }
  }
  await connection.commit();
  await connection.close();
  console.log('Companion migration complete.');
}

run().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
