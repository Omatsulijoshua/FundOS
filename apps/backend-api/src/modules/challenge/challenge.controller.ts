import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { PurchaseChallengeDto } from './dto/purchase-challenge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  @ApiOperation({ summary: 'List all available challenge presets for the current tenant firm' })
  async getChallenges(@CurrentTenant() tenant: any) {
    return this.challengeService.getChallenges(tenant.id);
  }

  @Post(':id/purchase')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a prop firm evaluation challenge' })
  async purchaseChallenge(
    @Param('id') challengeId: string,
    @Body() dto: PurchaseChallengeDto,
    @Req() req: any,
    @CurrentTenant() tenant: any
  ) {
    return this.challengeService.purchaseChallenge(req.user.id, tenant.id, challengeId, dto);
  }

  @Get('my-purchases')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the active and completed challenge purchases for the logged-in trader' })
  async getMyPurchases(@Req() req: any, @CurrentTenant() tenant: any) {
    return this.challengeService.getMyPurchases(req.user.id, tenant.id);
  }

  @Get('accounts/:accountId/rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Audit real-time daily drawdowns, max loss limits, and target margins compliance' })
  async getAccountRulesStatus(@Param('accountId') accountId: string) {
    return this.challengeService.getAccountRulesStatus(accountId);
  }

  @Post('accounts/:accountId/evaluate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger a rules check and transition the trader to the next phase' })
  async evaluateAccountRules(@Param('accountId') accountId: string) {
    return this.challengeService.evaluateAccountRules(accountId);
  }
}
