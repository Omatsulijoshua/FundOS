import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ChallengeService } from '../challenge/challenge.service';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { PayoutStatus } from '@prisma/client';
import { TradingPlatformEnum, PaymentMethodEnum } from '../challenge/dto/purchase-challenge.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly challengeService: ChallengeService
  ) {
    // Initialize default Stripe fallback instance
    const secret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_fundos_2026';
    this.stripe = new Stripe(secret, {
      apiVersion: '2024-09-30' as any,
    });
  }

  private async getStripeClientForTenant(orgId: string): Promise<Stripe> {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { orgId },
    });

    if (settings && settings.stripeConfig) {
      const config = settings.stripeConfig as Record<string, any>;
      if (config.secretKey) {
        return new Stripe(config.secretKey, {
          apiVersion: '2024-09-30' as any,
        });
      }
    }
    return this.stripe;
  }

  async createCheckoutSession(
    userId: string,
    orgId: string,
    challengeId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge preset not found');
    }

    const stripeClient = await this.getStripeClientForTenant(orgId);

    try {
      // In a real environment with valid keys, this provisions Stripe checkout:
      // Since this runs in sandbox/dev environments without actual stripe keys, we mock a checkout redirect URL
      const isMockMode = !process.env.STRIPE_SECRET_KEY;
      
      if (isMockMode) {
        // Return a mock checkout redirection URL pointing back to our local success handler
        const mockSessionId = `cs_test_${Math.random().toString(36).substring(7)}`;
        return {
          sessionId: mockSessionId,
          url: `${successUrl}?session_id=${mockSessionId}&challengeId=${challengeId}&orgId=${orgId}&userId=${userId}`,
          mock: true,
        };
      }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: challenge.currency.toLowerCase(),
              product_data: {
                name: challenge.name,
                description: `Prop firm challenge evaluation size: ${challenge.name}`,
              },
              unit_amount: Math.round(challenge.price.toNumber() * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          orgId,
          challengeId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
        mock: false,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate Stripe checkout session: ${error.message}`);
    }
  }

  async handleMockCheckoutSuccess(
    userId: string,
    orgId: string,
    challengeId: string,
    sessionId: string
  ) {
    // Provision simulated purchase directly for local mock sandbox
    return this.challengeService.purchaseChallenge(userId, orgId, challengeId, {
      platform: TradingPlatformEnum.MT5,
      paymentMethod: PaymentMethodEnum.STRIPE,
    });
  }

  async requestPayout(userId: string, orgId: string, dto: CreatePayoutRequestDto) {
    // 1. Fetch trader's USD wallet
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, currency: 'USD' },
    });

    if (!wallet) {
      throw new NotFoundException('Trader wallet not found');
    }

    const balance = wallet.balance.toNumber();
    if (balance < dto.amount) {
      throw new BadRequestException(`Insufficient wallet balance. You requested $${dto.amount} but only have $${balance}`);
    }

    // 2. Lock requested funds by deducting balance from wallet
    const newBalance = balance - dto.amount;
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    // 3. Create Withdrawal record
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        walletId: wallet.id,
        amount: dto.amount,
        method: dto.method,
        payoutDetails: dto.payoutDetails,
        status: 'PENDING',
      },
    });

    // 4. Record Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYOUT_REQUESTED',
        entityName: 'Withdrawal',
        entityId: withdrawal.id,
      },
    });

    return {
      message: 'Payout request submitted successfully. Funds have been locked awaiting audit approval.',
      withdrawalId: withdrawal.id,
      lockedAmount: dto.amount,
      remainingBalance: newBalance,
    };
  }

  async getPayoutRequests(orgId: string) {
    // Return all payout requests for wallets owned by users belonging to this organization
    return this.prisma.withdrawal.findMany({
      where: {
        wallet: {
          user: {
            memberships: {
              some: { orgId },
            },
          },
        },
      },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approvePayout(orgId: string, payoutId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: payoutId },
      include: { wallet: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Payout request not found');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException(`Payout is already processed (status: ${withdrawal.status})`);
    }

    // 1. Mark payout APPROVED and PROCESSED
    const updated = await this.prisma.withdrawal.update({
      where: { id: payoutId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    // 2. Create Billing Transaction log representing the checkout payout
    await this.prisma.transaction.create({
      data: {
        walletId: withdrawal.walletId,
        orgId,
        amount: withdrawal.amount,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        reference: withdrawal.id,
      },
    });

    // 3. Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: withdrawal.wallet.userId,
        action: 'PAYOUT_APPROVED',
        entityName: 'Withdrawal',
        entityId: payoutId,
      },
    });

    return {
      message: 'Payout request approved and processed successfully',
      withdrawal: updated,
    };
  }

  async declinePayout(orgId: string, payoutId: string, reason: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: payoutId },
      include: { wallet: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Payout request not found');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException(`Payout is already processed (status: ${withdrawal.status})`);
    }

    // 1. Return the locked funds back to the user's wallet balance
    const wallet = withdrawal.wallet;
    const restoredBalance = wallet.balance.toNumber() + withdrawal.amount.toNumber();

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: restoredBalance },
    });

    // 2. Mark payout status as REJECTED
    const updated = await this.prisma.withdrawal.update({
      where: { id: payoutId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
      },
    });

    // 3. Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: wallet.userId,
        action: 'PAYOUT_REJECTED',
        entityName: 'Withdrawal',
        entityId: payoutId,
      },
    });

    return {
      message: 'Payout request declined. Locked funds have been restored to trader wallet balance.',
      withdrawal: updated,
    };
  }
}
