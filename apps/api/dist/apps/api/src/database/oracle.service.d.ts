import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BindParameters, ExecuteOptions, Result } from 'oracledb';
export declare class OracleService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private pool;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    executeQuery<T = unknown>(sql: string, binds?: BindParameters, options?: ExecuteOptions): Promise<Result<T>>;
}
