import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { PrismaService } from '../../prisma.service';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [ChallengeModule],
  controllers: [IntegrationController],
  providers: [IntegrationService, PrismaService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
