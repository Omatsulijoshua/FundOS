import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMemberGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { SystemRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Affiliate & Referrals Management')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('opt-in')
  @UseGuards(JwtAuthGuard, TenantMemberGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as an active affiliate partner inside the organization' })
  async optIn(@Req() req: any, @CurrentTenant() tenant: any) {
    return this.affiliateService.optIn(req.user.id, tenant.id);
  }

  @Get('portal')
  @UseGuards(JwtAuthGuard, TenantMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate dashboard summary, payouts, and referral stats' })
  async getPortal(@Req() req: any, @CurrentTenant() tenant: any) {
    return this.affiliateService.getAffiliateProfile(req.user.id, tenant.id);
  }

  @Post('coupons')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create custom promo coupons (Admin only)' })
  async createCoupon(
    @CurrentTenant() tenant: any,
    @Body() dto: CreateCouponDto
  ) {
    return this.affiliateService.createCoupon(tenant.id, dto);
  }

  @Get('coupons/validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate a discount coupon code and return its discount percentage' })
  async validateCoupon(
    @Query('code') code: string,
    @CurrentTenant() tenant: any
  ) {
    if (!code) {
      throw new BadRequestException('Please provide a coupon code to validate');
    }
    return this.affiliateService.validateCoupon(tenant.id, code);
  }
}
