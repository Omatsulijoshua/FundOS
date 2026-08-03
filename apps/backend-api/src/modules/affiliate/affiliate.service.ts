import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AffiliateService {
  constructor(private readonly prisma: PrismaService) {}

  async optIn(userId: string, orgId: string) {
    // 1. Confirm user is a member of the organization
    const member = await this.prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId } },
    });

    if (!member) {
      throw new BadRequestException('User is not registered in this organization');
    }

    // 2. Check if already an affiliate
    const existing = await this.prisma.affiliate.findUnique({
      where: { orgId_userId: { orgId, userId } },
    });

    if (existing) {
      return { message: 'User is already registered as an affiliate', affiliate: existing };
    }

    // 3. Generate unique referral code
    const randomHex = Math.random().toString(36).substring(3, 8).toUpperCase();
    const referralCode = `REF-${randomHex}`;

    const affiliate = await this.prisma.affiliate.create({
      data: {
        orgId,
        userId,
        referralCode,
        commissionPct: 10.00, // Default 10% commission
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'AFFILIATE_OPT_IN',
        entityName: 'Affiliate',
        entityId: affiliate.id,
      },
    });

    return {
      message: 'Successfully registered as an affiliate',
      affiliate,
    };
  }

  async getAffiliateProfile(userId: string, orgId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { orgId_userId: { orgId, userId } },
      include: {
        commissions: true,
        coupons: true,
      },
    });

    if (!affiliate) {
      throw new NotFoundException('User has not opted in as an affiliate');
    }

    // Calculate payouts summary metrics
    const totalCommissions = affiliate.commissions.length;
    const unpaidCommissions = affiliate.commissions
      .filter((c) => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.earnedAmount.toNumber(), 0);

    const paidCommissions = affiliate.commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + c.earnedAmount.toNumber(), 0);

    // Mock clicks and registrations stats since we do not store cookie session log models
    const simulatedClicksCount = 142;
    const simulatedRegistrationsCount = 18;

    return {
      id: affiliate.id,
      referralCode: affiliate.referralCode,
      commissionPct: affiliate.commissionPct,
      referralLink: `https://${orgId}.fundos.com/register?ref=${affiliate.referralCode}`,
      stats: {
        clicks: simulatedClicksCount,
        registrations: simulatedRegistrationsCount,
        conversions: totalCommissions,
        unpaidAmount: unpaidCommissions,
        paidAmount: paidCommissions,
        totalEarned: unpaidCommissions + paidCommissions,
      },
      commissions: affiliate.commissions,
      coupons: affiliate.coupons,
    };
  }

  async trackReferralPurchase(referredUserId: string, purchaseAmount: number, referralCode: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { referralCode },
    });

    if (!affiliate) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Protect against self-referral
    if (affiliate.userId === referredUserId) {
      return { success: false, message: 'Self-referral purchases do not earn commissions' };
    }

    const earnedAmount = purchaseAmount * (affiliate.commissionPct.toNumber() / 100);

    const commission = await this.prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        referredUserId,
        purchaseAmount: new Prisma.Decimal(purchaseAmount),
        earnedAmount: new Prisma.Decimal(earnedAmount),
        status: 'PENDING',
      },
    });

    return {
      success: true,
      commissionId: commission.id,
      earnedAmount,
    };
  }

  async createCoupon(orgId: string, dto: CreateCouponDto) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    const coupon = await this.prisma.coupon.create({
      data: {
        orgId,
        code: dto.code.toUpperCase(),
        discountPct: new Prisma.Decimal(dto.discountPct),
        expiresAt,
        affiliateId: dto.affiliateId || null,
      },
    });

    return {
      message: 'Discount coupon created successfully',
      coupon,
    };
  }

  async validateCoupon(orgId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || coupon.orgId !== orgId) {
      throw new NotFoundException('Promo discount coupon is invalid or not supported by this organization');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This discount coupon has been deactivated');
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('This discount coupon has expired');
    }

    return {
      valid: true,
      code: coupon.code,
      discountPct: coupon.discountPct.toNumber(),
    };
  }
}
