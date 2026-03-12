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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodService = void 0;
const common_1 = require("@nestjs/common");
const mood_repository_1 = require("../database/repositories/mood.repository");
let MoodService = class MoodService {
    constructor(moodRepository) {
        this.moodRepository = moodRepository;
    }
    async create(userId, dto) {
        const entryId = `MOD_${Date.now()}`;
        await this.moodRepository.createMoodEntry(entryId, userId, dto.mood, dto.period, dto.notes);
        return { entryId };
    }
    async findAll(userId, query) {
        return this.moodRepository.getMoodEntries(userId, query.startDate);
    }
};
exports.MoodService = MoodService;
exports.MoodService = MoodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mood_repository_1.MoodRepository])
], MoodService);
//# sourceMappingURL=mood.service.js.map