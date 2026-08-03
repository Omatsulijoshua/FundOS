import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMemberGuard } from '../../common/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Trading Coach')
@Controller('ai')
@UseGuards(JwtAuthGuard, TenantMemberGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('accounts/:accountId/coach')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve an AI performance coach report analyzing trading behavior' })
  async getCoachSummary(@Param('accountId') accountId: string) {
    return this.aiService.getCoachSummary(accountId);
  }

  @Get('accounts/:accountId/recommendations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-driven market analysis and setup recommendations' })
  async getRecommendations(@Param('accountId') accountId: string) {
    return this.aiService.getTradeRecommendations(accountId);
  }

  @Post('accounts/:accountId/chat')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chat with the AI trading coach regarding strategy or psychology' })
  async chatWithCoach(
    @Param('accountId') accountId: string,
    @Body('message') message: string,
    @Body('history') history?: any[]
  ) {
    if (!message) {
      throw new BadRequestException('Please provide a message string for the AI coach');
    }
    return this.aiService.chatWithCoach(accountId, message, history || []);
  }
}
