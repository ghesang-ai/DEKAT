import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProcessor } from './ai.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'ai-compare' }),
  ],
  controllers: [AiController],
  providers: [AiService, AiProcessor],
})
export class AiModule {}
