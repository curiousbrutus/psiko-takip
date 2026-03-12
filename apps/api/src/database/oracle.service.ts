import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  BindParameters,
  Connection,
  ExecuteOptions,
  Pool,
  Result,
} from 'oracledb';
const oracledb: typeof import('oracledb') = require('oracledb');

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OracleService.name);
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const user =
      this.configService.get<string>('oracle.user') ?? process.env.ORACLE_USER;
    const password =
      this.configService.get<string>('oracle.password') ?? process.env.ORACLE_PASSWORD;
    const connectionString =
      this.configService.get<string>('oracle.connectionString') ??
      process.env.ORACLE_CONNECTION_STRING;
    const poolMin = this.configService.get<number>('oracle.poolMin') ?? 2;
    const poolMax = this.configService.get<number>('oracle.poolMax') ?? 10;

    if (!user || !password || !connectionString) {
      this.logger.warn('Oracle config missing; API started without DB pool');
      return;
    }

    oracledb.fetchAsString = [oracledb.CLOB];

    this.pool = await oracledb.createPool({
      user,
      password,
      connectString: connectionString,
      poolMin,
      poolMax,
      poolAlias: 'default',
    });

    this.logger.log('Oracle pool initialized');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close(10);
      this.logger.log('Oracle pool closed');
    }
  }

  async executeQuery<T = unknown>(
    sql: string,
    binds: BindParameters = {},
    options: ExecuteOptions = {}
  ): Promise<Result<T>> {
    if (!this.pool) {
      throw new Error('Oracle pool not initialized');
    }

    let connection: Connection | undefined;
    try {
      connection = await this.pool.getConnection();
      return await connection.execute<T>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options,
      });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}
