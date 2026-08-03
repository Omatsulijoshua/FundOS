import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMemberGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { SystemRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payment Processing & Payouts')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout/:challengeId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session for challenge purchase' })
  async createCheckoutSession(
    @Param('challengeId') challengeId: string,
    @Query('successUrl') successUrl: string,
    @Query('cancelUrl') cancelUrl: string,
    @Req() req: any,
    @CurrentTenant() tenant: any
  ) {
    if (!successUrl || !cancelUrl) {
      throw new BadRequestException('Please provide successUrl and cancelUrl parameters');
    }
    return this.paymentService.createCheckoutSession(
      req.user.id,
      tenant.id,
      challengeId,
      successUrl,
      cancelUrl
    );
  }

  @Get('checkout/success')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Callback to confirm checkout payment and provision credentials' })
  async handleCheckoutSuccess(
    @Query('userId') userId: string,
    @Query('orgId') orgId: string,
    @Query('challengeId') challengeId: string,
    @Query('session_id') sessionId: string
  ) {
    if (!userId || !orgId || !challengeId || !sessionId) {
      throw new BadRequestException('Invalid callback query parameters');
    }
    return this.paymentService.handleMockCheckoutSuccess(userId, orgId, challengeId, sessionId);
  }

  @Post('payout-requests')
  @UseGuards(JwtAuthGuard, TenantMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a profit withdrawal from your trader USD wallet' })
  async requestPayout(
    @Req() req: any,
    @CurrentTenant() tenant: any,
    @Body() dto: CreatePayoutRequestDto
  ) {
    return this.paymentService.requestPayout(req.user.id, tenant.id, dto);
  }

  @Get('payout-requests')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all pending and completed payout requests for admin audit' })
  async getPayoutRequests(@CurrentTenant() tenant: any) {
    return this.paymentService.getPayoutRequests(tenant.id);
  }

  @Post('payout-requests/:id/approve')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve and release a pending payout' })
  async approvePayout(
    @Param('id') payoutId: string,
    @CurrentTenant() tenant: any
  ) {
    return this.paymentService.approvePayout(tenant.id, payoutId);
  }

  @Post('payout-requests/:id/decline')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decline a payout request and restore locked wallet balance' })
  async declinePayout(
    @Param('id') payoutId: string,
    @Body('reason') reason: string,
    @CurrentTenant() tenant: any
  ) {
    if (!reason) {
      throw new BadRequestException('Please provide a reason for declining the payout request');
    }
    return this.paymentService.declinePayout(tenant.id, payoutId, reason);
  }
}
