import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMemberGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Risk Management')
@Controller('risk')
@UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('accounts/:accountId/violations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all triggered risk parameters violations for a trading account' })
  async getViolations(@Param('accountId') accountId: string) {
    return this.riskService.getViolations(accountId);
  }

  @Get('accounts/:accountId/score')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the latest calculated consistency risk score' })
  async getLatestRiskScore(@Param('accountId') accountId: string) {
    return this.riskService.getLatestRiskScore(accountId);
  }

  @Post('accounts/:accountId/score/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recalculate trade consistency and behavioral risk score' })
  async calculateRiskScore(@Param('accountId') accountId: string) {
    return this.riskService.calculateRiskScore(accountId);
  }

  @Post('accounts/:accountId/check')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually run all risk validation audits (hedging, lot sizing spikes)' })
  async runChecks(@Param('accountId') accountId: string) {
    return this.riskService.runAllChecks(accountId);
  }

  @Post('violations/:id/override')
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Override and delete a risk violation, restoring account to active' })
  async overrideViolation(
    @Param('id') violationId: string,
    @Body('reason') reason: string
  ) {
    return this.riskService.removeViolationOverride(violationId, reason);
  }
}
