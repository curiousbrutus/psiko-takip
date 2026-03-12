export declare const jwtConfig: (() => {
    secret: string | undefined;
    refreshSecret: string | undefined;
    expiresIn: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string | undefined;
    refreshSecret: string | undefined;
    expiresIn: string;
    refreshExpiresIn: string;
}>;
