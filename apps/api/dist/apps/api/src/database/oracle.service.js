"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OracleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const oracledb = require('oracledb');
let OracleService = OracleService_1 = class OracleService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OracleService_1.name);
        this.pool = null;
    }
    async onModuleInit() {
        const user = this.configService.get('oracle.user') ?? process.env.ORACLE_USER;
        const password = this.configService.get('oracle.password') ?? process.env.ORACLE_PASSWORD;
        const connectionString = this.configService.get('oracle.connectionString') ??
            process.env.ORACLE_CONNECTION_STRING;
        const poolMin = this.configService.get('oracle.poolMin') ?? 2;
        const poolMax = this.configService.get('oracle.poolMax') ?? 10;
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
    async executeQuery(sql, binds = {}, options = {}) {
        if (!this.pool) {
            throw new Error('Oracle pool not initialized');
        }
        let connection;
        try {
            connection = await this.pool.getConnection();
            return await connection.execute(sql, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                ...options,
            });
        }
        finally {
            if (connection) {
                await connection.close();
            }
        }
    }
};
exports.OracleService = OracleService;
exports.OracleService = OracleService = OracleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OracleService);
//# sourceMappingURL=oracle.service.js.map