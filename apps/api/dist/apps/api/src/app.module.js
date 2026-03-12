"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const appointments_module_1 = require("./appointments/appointments.module");
const assessment_module_1 = require("./assessment/assessment.module");
const collaborative_tasks_module_1 = require("./collaborative-tasks/collaborative-tasks.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const gamification_module_1 = require("./gamification/gamification.module");
const gratitude_module_1 = require("./gratitude/gratitude.module");
const journal_module_1 = require("./journal/journal.module");
const mood_module_1 = require("./mood/mood.module");
const tests_module_1 = require("./tests/tests.module");
const oracle_config_1 = require("./config/oracle.config");
const jwt_config_1 = require("./config/jwt.config");
const oracle_module_1 = require("./database/oracle.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [oracle_config_1.oracleConfig, jwt_config_1.jwtConfig],
                envFilePath: ['apps/api/.env', '.env', '../../.env'],
            }),
            oracle_module_1.OracleModule,
            appointments_module_1.AppointmentsModule,
            assessment_module_1.AssessmentModule,
            collaborative_tasks_module_1.CollaborativeTasksModule,
            auth_module_1.AuthModule,
            mood_module_1.MoodModule,
            journal_module_1.JournalModule,
            gratitude_module_1.GratitudeModule,
            gamification_module_1.GamificationModule,
            tests_module_1.TestsModule,
            users_module_1.UsersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map