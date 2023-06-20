import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AiService } from './ai/ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    const output = await this.aiService.generateText(
      'what is the highest building in the worl',
    );

    return output;
    // return this.appService.getHello();
  }
}
