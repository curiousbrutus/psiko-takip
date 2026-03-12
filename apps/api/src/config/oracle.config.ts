import { registerAs } from '@nestjs/config';

export const oracleConfig = registerAs('oracle', () => ({
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectionString: process.env.ORACLE_CONNECTION_STRING,
  poolMin: Number(process.env.ORACLE_POOL_MIN || 2),
  poolMax: Number(process.env.ORACLE_POOL_MAX || 10),
}));
