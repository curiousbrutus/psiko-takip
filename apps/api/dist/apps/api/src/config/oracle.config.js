"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleConfig = void 0;
const config_1 = require("@nestjs/config");
exports.oracleConfig = (0, config_1.registerAs)('oracle', () => ({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectionString: process.env.ORACLE_CONNECTION_STRING,
    poolMin: Number(process.env.ORACLE_POOL_MIN || 2),
    poolMax: Number(process.env.ORACLE_POOL_MAX || 10),
}));
//# sourceMappingURL=oracle.config.js.map