import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMemberGuard } from '../../common/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Performance & Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantMemberGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('accounts/:accountId/performance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate detailed trading metrics including Win Rate, Sharpe Ratio, Profit Factor' })
  async getPerformance(@Param('accountId') accountId: string) {
    return this.analyticsService.getAccountPerformance(accountId);
  }

  @Get('accounts/:accountId/equity-curve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of cumulative balance points to construct equity graphs' })
  async getEquityCurve(@Param('accountId') accountId: string) {
    return this.analyticsService.getEquityCurve(accountId);
  }
}
