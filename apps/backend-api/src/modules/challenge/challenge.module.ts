import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ChallengeController],
  providers: [ChallengeService, PrismaService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
