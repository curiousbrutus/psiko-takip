/**
 * Oracle Database Connection Configuration
 *
 * This module handles the Oracle database connection pool for the application.
 * It uses environment variables for configuration and provides a singleton
 * connection pool for efficient database access.
 */

import oracledb from 'oracledb';

// Configure oracledb for better performance
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = false; // We handle commits explicitly

// Connection pool configuration
const poolConfig = {
  user: process.env.ORACLE_USER || 'psikotakip_user',
  password: process.env.ORACLE_PASSWORD || '',
  connectString:
    process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XEPDB1',
  poolMin: parseInt(process.env.ORACLE_POOL_MIN || '2', 10),
  poolMax: parseInt(process.env.ORACLE_POOL_MAX || '10', 10),
  poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '1', 10),
  poolTimeout: parseInt(process.env.ORACLE_POOL_TIMEOUT || '60', 10),
  enableStatistics: process.env.NODE_ENV === 'development',
};

let pool: oracledb.Pool | null = null;

/**
 * Initialize the Oracle connection pool
 */
export async function initializePool(): Promise<void> {
  try {
    if (!pool) {
      pool = await oracledb.createPool(poolConfig);
      console.log('Oracle connection pool created successfully');

      if (process.env.NODE_ENV === 'development') {
        const poolStats = pool.getStatistics();
        console.log('Pool statistics:', poolStats);
      }
    }
  } catch (err) {
    console.error('Error creating Oracle connection pool:', err);
    throw err;
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<oracledb.Connection> {
  try {
    if (!pool) {
      await initializePool();
    }

    if (!pool) {
      throw new Error('Database pool is not initialized');
    }

    return await pool.getConnection();
  } catch (err) {
    console.error('Error getting connection from pool:', err);
    throw err;
  }
}

/**
 * Close the connection pool (use on application shutdown)
 */
export async function closePool(): Promise<void> {
  try {
    if (pool) {
      await pool.close(10); // 10 seconds drain time
      pool = null;
      console.log('Oracle connection pool closed');
    }
  } catch (err) {
    console.error('Error closing Oracle connection pool:', err);
    throw err;
  }
}

/**
 * Execute a query with automatic connection management
 */
export async function executeQuery<T = any>(
  sql: string,
  binds: any = {},
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<T>> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    const result = await connection.execute<T>(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
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

/**
 * Execute a stored procedure with automatic connection management
 */
export async function executeProcedure(
  procedureName: string,
  binds: any = {}
): Promise<any> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN ${procedureName}; END;`,
      binds,
      { autoCommit: true }
    );
    return result;
  } catch (err) {
    console.error(`Error executing procedure ${procedureName}:`, err);
    throw err;
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

/**
 * Execute multiple queries in a transaction
 */
export async function executeTransaction(
  callback: (connection: oracledb.Connection) => Promise<void>
): Promise<void> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    await callback(connection);
    await connection.commit();
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Transaction error:', err);
    throw err;
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

/**
 * Generate a unique ID with prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as health FROM DUAL');
    return result.rows && result.rows.length > 0;
  } catch (err) {
    console.error('Database health check failed:', err);
    return false;
  }
}

// Initialize pool on module load
if (process.env.NODE_ENV !== 'test') {
  initializePool().catch(err => {
    console.error('Failed to initialize database pool on startup:', err);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing database pool');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing database pool');
  await closePool();
  process.exit(0);
});

export default {
  getConnection,
  executeQuery,
  executeProcedure,
  executeTransaction,
  closePool,
  healthCheck,
  generateId,
};
