export declare const oracleConfig: (() => {
    user: string | undefined;
    password: string | undefined;
    connectionString: string | undefined;
    poolMin: number;
    poolMax: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    user: string | undefined;
    password: string | undefined;
    connectionString: string | undefined;
    poolMin: number;
    poolMax: number;
}>;
