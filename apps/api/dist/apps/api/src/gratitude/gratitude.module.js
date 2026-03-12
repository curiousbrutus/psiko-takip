"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GratitudeModule = void 0;
const common_1 = require("@nestjs/common");
const gratitude_repository_1 = require("../database/repositories/gratitude.repository");
const gratitude_controller_1 = require("./gratitude.controller");
const gratitude_service_1 = require("./gratitude.service");
let GratitudeModule = class GratitudeModule {
};
exports.GratitudeModule = GratitudeModule;
exports.GratitudeModule = GratitudeModule = __decorate([
    (0, common_1.Module)({
        providers: [gratitude_repository_1.GratitudeRepository, gratitude_service_1.GratitudeService],
        controllers: [gratitude_controller_1.GratitudeController],
    })
], GratitudeModule);
//# sourceMappingURL=gratitude.module.js.map