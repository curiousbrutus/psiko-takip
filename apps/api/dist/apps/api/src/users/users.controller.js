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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const change_password_dto_1 = require("./dto/change-password.dto");
const connect_client_dto_1 = require("./dto/connect-client.dto");
const search_users_query_dto_1 = require("./dto/search-users-query.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const users_service_1 = require("./users.service");
const common_2 = require("@nestjs/common");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        const profile = await this.usersService.getProfile(req.user.userId);
        return {
            success: true,
            data: profile,
        };
    }
    async updateProfile(req, dto) {
        await this.usersService.updateProfile(req.user.userId, dto);
        const profile = await this.usersService.getProfile(req.user.userId);
        return {
            success: true,
            data: profile,
        };
    }
    async changePassword(req, dto) {
        await this.usersService.changePassword(req.user.userId, dto.newPassword);
        return {
            success: true,
            data: true,
        };
    }
    async getClients(req) {
        const data = await this.usersService.getTherapistClients(req.user.userId);
        return { success: true, data };
    }
    async connectClient(req, dto) {
        const data = await this.usersService.connectClientToTherapist(req.user.userId, dto);
        return {
            success: true,
            message: 'Danisan basariyla baglandi',
            data,
        };
    }
    async getClientDetail(req, clientId) {
        const data = await this.usersService.getClientDetailForTherapist(req.user.userId, clientId);
        return { success: true, data };
    }
    async searchUsers(query) {
        const data = await this.usersService.searchUsers(query);
        return { success: true, data };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('clients'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getClients", null);
__decorate([
    (0, common_2.Post)('clients'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, connect_client_dto_1.ConnectClientDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "connectClient", null);
__decorate([
    (0, common_1.Get)('clients/:clientId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_2.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getClientDetail", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_2.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_users_query_dto_1.SearchUsersQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map