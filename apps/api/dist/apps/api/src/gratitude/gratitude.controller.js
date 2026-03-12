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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GratitudeController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_gratitude_dto_1 = require("./dto/create-gratitude.dto");
const gratitude_service_1 = require("./gratitude.service");
let GratitudeController = class GratitudeController {
    constructor(gratitudeService) {
        this.gratitudeService = gratitudeService;
    }
    async create(req, dto) {
        const data = await this.gratitudeService.create(req.user.userId, dto);
        return { success: true, data };
    }
    async findAll(req) {
        const data = await this.gratitudeService.findAll(req.user.userId);
        return { success: true, data };
    }
};
exports.GratitudeController = GratitudeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_gratitude_dto_1.CreateGratitudeDto]),
    __metadata("design:returntype", Promise)
], GratitudeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GratitudeController.prototype, "findAll", null);
exports.GratitudeController = GratitudeController = __decorate([
    (0, common_1.Controller)('gratitude-entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gratitude_service_1.GratitudeService])
], GratitudeController);
//# sourceMappingURL=gratitude.controller.js.map