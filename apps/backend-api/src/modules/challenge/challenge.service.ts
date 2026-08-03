import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PurchaseChallengeDto } from './dto/purchase-challenge.dto';
import { AccountStatus, ChallengeStatus, SystemRole } from '@prisma/client';

@Injectable()
export class ChallengeService {
  constructor(private readonly prisma: PrismaService) {}

  private parseStartingBalance(name: string): number {
    const clean = name.replace(/,/g, '');
    const match = clean.match(/\$(\d+)/);
    return match ? parseFloat(match[1]) : 10000;
  }

  async getChallenges(orgId: string) {
    return this.prisma.challenge.findMany({
      where: { orgId, deletedAt: null },
      orderBy: { price: 'asc' },
    });
  }

  async purchaseChallenge(
    userId: string,
    orgId: string,
    challengeId: string,
    dto: PurchaseChallengeDto
  ) {
    const challenge = await this.prisma.challenge.findFirst({
      where: { id: challengeId, orgId, deletedAt: null },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge preset not found in this organization');
    }

    // Resolve traderId from user and org (OrganizationMember id)
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!member) {
      throw new BadRequestException('User is not a member of this organization');
    }

    // Resolve platform object
    const platformObj = await this.prisma.tradingPlatform.findFirst({
      where: {
        name: dto.platform,
        isActive: true,
      },
    });

    if (!platformObj) {
      throw new BadRequestException(`Trading platform '${dto.platform}' is not supported or active`);
    }

    // Find user's USD Wallet
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, currency: 'USD' },
    });

    if (!wallet) {
      throw new BadRequestException('USD wallet not found for the user. Please initialize a wallet first.');
    }

    // 1. Create Challenge Purchase record
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + challenge.durationDays);

    const purchase = await this.prisma.challengePurchase.create({
      data: {
        challengeId,
        traderId: member.id,
        status: 'ACTIVE',
        endsAt,
      },
    });

    // 2. Provision Simulated Trading Account Credentials
    const randomLogin = Math.floor(1000000 + Math.random() * 9000000).toString();
    const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const serverName = dto.platform === 'MT5' ? 'FundOS-Demo-Server' : 'cTrader-FundOS-Live';

    // Calculate drawdown floors
    const startingBalance = this.parseStartingBalance(challenge.name);
    const dailyDrawdownPct = challenge.dailyDrawdownPct.toNumber();
    const maxDrawdownPct = challenge.maxDrawdownPct.toNumber();

    const maxDailyDrawdownLimit = startingBalance - (startingBalance * (dailyDrawdownPct / 100));
    const maxDrawdownLimit = startingBalance - (startingBalance * (maxDrawdownPct / 100));

    const account = await this.prisma.tradingAccount.create({
      data: {
        orgId,
        purchaseId: purchase.id,
        platformId: platformObj.id,
        login: randomLogin,
        password: randomPassword,
        investorPassword: randomPassword + 'Inv',
        serverName,
        balance: startingBalance,
        equity: startingBalance,
        startingBalance: startingBalance,
        maxDailyDrawdownLimit,
        maxDrawdownLimit,
        status: 'ACTIVE',
      },
    });

    // 3. Create active transaction record in the ledger
    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        orgId,
        amount: challenge.price,
        type: 'PURCHASE',
        status: 'COMPLETED',
        reference: dto.paymentMethod,
      },
    });

    // 4. Record Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CHALLENGE_PURCHASED',
        entityName: 'ChallengePurchase',
        entityId: purchase.id,
      },
    });

    return {
      message: 'Challenge purchased and trading account provisioned successfully',
      purchaseId: purchase.id,
      account: {
        id: account.id,
        login: account.login,
        password: account.password,
        server: account.serverName,
        platform: dto.platform,
        balance: account.balance,
      },
    };
  }

  async getMyPurchases(userId: string, orgId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!member) {
      return [];
    }

    return this.prisma.challengePurchase.findMany({
      where: { traderId: member.id },
      include: {
        challenge: true,
        accounts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAccountRulesStatus(accountId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: {
        purchase: {
          include: {
            challenge: true,
            accounts: true,
          },
        },
        trades: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Trading account not found');
    }

    if (!account.purchaseId || !account.purchase) {
      throw new BadRequestException('This account is not linked to any active challenge purchase');
    }

    const challenge = account.purchase.challenge;
    const currentBalance = account.balance.toNumber();
    const currentEquity = account.equity.toNumber();
    const startingBalance = account.startingBalance.toNumber();

    // Determine current phase based on count of accounts linked to purchase
    const accountsCount = account.purchase.accounts.length;
    let phase = 'CHALLENGE_PHASE_1';
    let targetPercent = challenge.profitTargetPct.toNumber();

    if (accountsCount === 2) {
      phase = 'CHALLENGE_PHASE_2';
      // Typically Phase 2 target is half of Phase 1 (e.g. 5% target)
      targetPercent = Math.max(5, targetPercent / 2);
    } else if (accountsCount >= 3 || account.purchase.status === 'PASSED') {
      phase = 'FUNDED';
      targetPercent = 0; // Funded accounts don't have targets
    }

    const profitTargetAmount = startingBalance * (targetPercent / 100);
    const targetBalance = startingBalance + profitTargetAmount;
    const isTargetMet = targetPercent > 0 ? currentBalance >= targetBalance : true;

    // Drawdown Violations
    const dailyDrawdownFloor = account.maxDailyDrawdownLimit.toNumber();
    const isDailyLossViolated = currentEquity <= dailyDrawdownFloor;

    const maxDrawdownFloor = account.maxDrawdownLimit.toNumber();
    const isMaxLossViolated = currentEquity <= maxDrawdownFloor;

    // Minimum Trading Days Check
    const uniqueDays = new Set(
      account.trades.map((t) => new Date(t.createdAt).toDateString())
    );
    const currentTradingDays = uniqueDays.size;
    const minTradingDays = challenge.minTradingDays;
    const isTradingDaysMet = currentTradingDays >= minTradingDays;

    return {
      accountId: account.id,
      accountType: phase,
      status: account.status,
      startingBalance,
      currentBalance,
      currentEquity,
      rules: {
        profitTarget: {
          limitPercent: targetPercent,
          targetAmount: profitTargetAmount,
          targetValue: targetBalance,
          currentValue: Math.max(0, currentBalance - startingBalance),
          isMet: isTargetMet,
        },
        maxDrawdown: {
          limitPercent: challenge.maxDrawdownPct.toNumber(),
          floorValue: maxDrawdownFloor,
          currentValue: Math.max(0, startingBalance - currentEquity),
          isViolated: isMaxLossViolated,
        },
        dailyDrawdown: {
          limitPercent: challenge.dailyDrawdownPct.toNumber(),
          floorValue: dailyDrawdownFloor,
          currentValue: Math.max(0, startingBalance - currentEquity),
          isViolated: isDailyLossViolated,
        },
        tradingDays: {
          required: minTradingDays,
          current: currentTradingDays,
          isMet: isTradingDaysMet,
        },
      },
      hasViolations: isMaxLossViolated || isDailyLossViolated,
      canTransition: isTargetMet && isTradingDaysMet && !isMaxLossViolated && !isDailyLossViolated,
    };
  }

  async evaluateAccountRules(accountId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Trading account not found');
    }

    if (account.status === 'VIOLATED' || account.status === 'ARCHIVED') {
      return { message: 'Account has already been fully processed', status: account.status };
    }

    if (!account.purchaseId) {
      throw new BadRequestException('This account is not linked to any active challenge purchase');
    }

    const rulesStatus = await this.getAccountRulesStatus(accountId);

    // 1. Process violations
    if (rulesStatus.hasViolations) {
      await this.prisma.tradingAccount.update({
        where: { id: accountId },
        data: { status: 'VIOLATED' },
      });

      // Update purchase status
      await this.prisma.challengePurchase.update({
        where: { id: account.purchaseId },
        data: { status: 'FAILED' },
      });

      return {
        message: 'Account violated trading parameters and was suspended',
        status: 'VIOLATED',
      };
    }

    // 2. Process Phase Transitions
    if (rulesStatus.canTransition) {
      if (rulesStatus.accountType === 'CHALLENGE_PHASE_1') {
        // Transition from Phase 1 to Phase 2
        await this.prisma.tradingAccount.update({
          where: { id: accountId },
          data: { status: 'ARCHIVED' },
        });

        // Provision Phase 2 Account
        const randomLogin = Math.floor(1000000 + Math.random() * 9000000).toString();
        const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';

        const nextAccount = await this.prisma.tradingAccount.create({
          data: {
            orgId: account.orgId,
            purchaseId: account.purchaseId,
            platformId: account.platformId,
            login: randomLogin,
            password: randomPassword,
            investorPassword: randomPassword + 'Inv',
            serverName: account.serverName,
            balance: account.startingBalance,
            equity: account.startingBalance,
            startingBalance: account.startingBalance,
            maxDailyDrawdownLimit: account.maxDailyDrawdownLimit,
            maxDrawdownLimit: account.maxDrawdownLimit,
            status: 'ACTIVE',
          },
        });

        return {
          message: 'Phase 1 passed! Provisioned Phase 2 trading account.',
          status: 'PASSED_PHASE_1',
          nextAccount: {
            login: nextAccount.login,
            password: nextAccount.password,
          },
        };
      } else if (rulesStatus.accountType === 'CHALLENGE_PHASE_2') {
        // Transition from Phase 2 to Funded Account!
        await this.prisma.tradingAccount.update({
          where: { id: accountId },
          data: { status: 'ARCHIVED' },
        });

        await this.prisma.challengePurchase.update({
          where: { id: account.purchaseId },
          data: { status: 'PASSED' },
        });

        // Provision Live Funded Account
        const randomLogin = Math.floor(1000000 + Math.random() * 9000000).toString();
        const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';

        const fundedAccount = await this.prisma.tradingAccount.create({
          data: {
            orgId: account.orgId,
            purchaseId: account.purchaseId,
            platformId: account.platformId,
            login: randomLogin,
            password: randomPassword,
            investorPassword: randomPassword + 'Inv',
            serverName: 'FundOS-Live-Server',
            balance: account.startingBalance,
            equity: account.startingBalance,
            startingBalance: account.startingBalance,
            maxDailyDrawdownLimit: account.maxDailyDrawdownLimit,
            maxDrawdownLimit: account.maxDrawdownLimit,
            status: 'ACTIVE',
          },
        });

        // Query member to find userId
        const purchaseRecord = await this.prisma.challengePurchase.findUnique({
          where: { id: account.purchaseId },
        });

        if (purchaseRecord) {
          const memberRecord = await this.prisma.organizationMember.findUnique({
            where: { id: purchaseRecord.traderId },
          });

          if (memberRecord) {
            // Create audit log for trader
            await this.prisma.auditLog.create({
              data: {
                userId: memberRecord.userId,
                action: 'FUNDED_STATUS_GRANTED',
                entityName: 'TradingAccount',
                entityId: fundedAccount.id,
              },
            });
          }
        }

        return {
          message: 'Phase 2 passed! Congratulations, you are now a Funded Trader!',
          status: 'PASSED_PHASE_2',
          nextAccount: {
            login: fundedAccount.login,
            password: fundedAccount.password,
          },
        };
      }
    }

    return {
      message: 'Evaluation complete. Current rules status check remains active.',
      status: account.status,
    };
  }
}
