import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaService } from '../../prisma.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { RiskModule } from '../risk/risk.module';

@Module({
  imports: [AnalyticsModule, RiskModule],
  controllers: [AiController],
  providers: [AiService, PrismaService],
  exports: [AiService],
})
export class AiModule {}
