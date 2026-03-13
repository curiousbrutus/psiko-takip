import { Body, Controller, Get, Post } from '@nestjs/common';
import { GenerateAiDto } from './dto/generate-ai.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  async health() {
    const data = await this.aiService.getHealth();
    return { success: true, data };
  }

  @Get('models')
  async models() {
    const data = await this.aiService.getModels();
    return { success: true, data };
  }

  @Post('generate')
  async generate(@Body() dto: GenerateAiDto) {
    const data = await this.aiService.generate(dto);
    return { success: true, data };
  }
}
