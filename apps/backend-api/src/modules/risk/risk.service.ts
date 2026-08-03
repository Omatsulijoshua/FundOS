import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ViolationType, AccountStatus } from '@prisma/client';

@Injectable()
export class RiskService {
  constructor(private readonly prisma: PrismaService) {}

  async getViolations(accountId: string) {
    return this.prisma.riskViolation.findMany({
      where: { accountId },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async getLatestRiskScore(accountId: string) {
    return this.prisma.riskScore.findFirst({
      where: { accountId },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  async triggerViolation(
    accountId: string,
    type: ViolationType,
    description: string,
    metadata: Record<string, any> = {}
  ) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Trading account ${accountId} not found`);
    }

    if (account.status === 'VIOLATED') {
      return { message: 'Account is already marked violated', account };
    }

    // 1. Create Risk Violation log
    const violation = await this.prisma.riskViolation.create({
      data: {
        accountId,
        violationType: type,
        description,
        metadata,
      },
    });

    // 2. Suspend Trading Account
    const updatedAccount = await this.prisma.tradingAccount.update({
      where: { id: accountId },
      data: { status: 'VIOLATED' },
    });

    // 3. Mark challenge purchase failed if linked
    if (account.purchaseId) {
      await this.prisma.challengePurchase.update({
        where: { id: account.purchaseId },
        data: { status: 'FAILED' },
      });
    }

    // 4. Record in Audit Log
    let userId = '';
    if (account.purchaseId) {
      const purchaseRecord = await this.prisma.challengePurchase.findUnique({
        where: { id: account.purchaseId },
      });
      if (purchaseRecord) {
        const memberRecord = await this.prisma.organizationMember.findUnique({
          where: { id: purchaseRecord.traderId },
        });
        if (memberRecord) {
          userId = memberRecord.userId;
        }
      }
    }

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'RISK_VIOLATION_TRIGGERED',
        entityName: 'RiskViolation',
        entityId: violation.id,
      },
    });

    return {
      message: `Account suspended due to ${type}: ${description}`,
      violation,
      account: updatedAccount,
    };
  }

  async checkHedging(accountId: string) {
    // Fetch open positions
    const positions = await this.prisma.position.findMany({
      where: { accountId },
    });

    const symbolGroups = new Map<string, string[]>();
    for (const pos of positions) {
      const types = symbolGroups.get(pos.symbol) || [];
      types.push(pos.type); // 'BUY' or 'SELL'
      symbolGroups.set(pos.symbol, types);
    }

    for (const [symbol, types] of symbolGroups.entries()) {
      if (types.includes('BUY') && types.includes('SELL')) {
        // Hedging detected!
        return this.triggerViolation(
          accountId,
          'SUSPICIOUS_BEHAVIOR',
          `Hedging violation detected: Simultaneous BUY and SELL open positions on ${symbol}`,
          { checkType: 'HEDGING', symbol }
        );
      }
    }

    return { success: true, message: 'No hedging violations found' };
  }

  async checkSpikeSizing(accountId: string) {
    const trades = await this.prisma.trade.findMany({
      where: { accountId, type: { in: ['BUY', 'SELL'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (trades.length < 5) {
      return { success: true, message: 'Insufficient trade count for sizing variance check' };
    }

    const latestTrade = trades[0];
    const pastTrades = trades.slice(1);

    const pastVolumes = pastTrades.map((t) => t.volume.toNumber());
    const averageVolume = pastVolumes.reduce((a, b) => a + b, 0) / pastVolumes.length;

    const latestVolume = latestTrade.volume.toNumber();

    // Sizing spike threshold: 3.5x average sizing
    if (latestVolume > averageVolume * 3.5) {
      return this.triggerViolation(
        accountId,
        'SUSPICIOUS_BEHAVIOR',
        `Sizing Spike violation detected: Trade ticket volume of ${latestVolume} lots exceeds 3.5x average sizing history of ${averageVolume.toFixed(2)} lots`,
        { checkType: 'SPIKE_SIZING', latestVolume, averageVolume }
      );
    }

    return { success: true, message: 'No lot sizing spike violations detected' };
  }

  async runAllChecks(accountId: string) {
    const hedgingCheck = await this.checkHedging(accountId);
    if (hedgingCheck.hasOwnProperty('violation')) {
      return hedgingCheck;
    }

    const sizingCheck = await this.checkSpikeSizing(accountId);
    if (sizingCheck.hasOwnProperty('violation')) {
      return sizingCheck;
    }

    return { success: true, message: 'All risk parameter checks passed' };
  }

  async calculateRiskScore(accountId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: { trades: true },
    });

    if (!account) {
      throw new NotFoundException('Trading account not found');
    }

    const trades = account.trades;
    if (trades.length === 0) {
      return this.prisma.riskScore.create({
        data: {
          accountId,
          score: 100, // default maximum score
          metrics: { winRate: 100, profitFactor: 0, revengeTrading: 0 },
        },
      });
    }

    // Win Rate Calculation
    const winningTrades = trades.filter((t) => t.profit.toNumber() > 0);
    const winRate = (winningTrades.length / trades.length) * 100;

    // Profit Factor Calculation
    const grossProfit = trades
      .filter((t) => t.profit.toNumber() > 0)
      .reduce((sum, t) => sum + t.profit.toNumber(), 0);
    const grossLoss = Math.abs(
      trades
        .filter((t) => t.profit.toNumber() < 0)
        .reduce((sum, t) => sum + t.profit.toNumber(), 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit;

    // Revenge Trading heuristic: trades opened within 10 minutes of a losing trade
    let revengeTradesCount = 0;
    for (let i = 0; i < trades.length - 1; i++) {
      const currentTrade = trades[i];
      if (currentTrade.profit.toNumber() < 0) {
        const nextTrade = trades[i + 1];
        const timeDiff = Math.abs(nextTrade.createdAt.getTime() - currentTrade.createdAt.getTime());
        if (timeDiff <= 10 * 60 * 1000) {
          revengeTradesCount++;
        }
      }
    }
    const revengeTradingPct = (revengeTradesCount / Math.max(1, trades.length)) * 100;

    // Consistency score deduction algorithm
    let score = 100;
    if (winRate < 40) score -= 15;
    if (profitFactor < 1.2) score -= 20;
    if (revengeTradingPct > 30) score -= 15;

    score = Math.max(10, Math.min(100, score));

    return this.prisma.riskScore.create({
      data: {
        accountId,
        score,
        metrics: {
          winRate: Math.round(winRate),
          profitFactor: parseFloat(profitFactor.toFixed(2)),
          revengeTradingPct: Math.round(revengeTradingPct),
        },
      },
    });
  }

  async removeViolationOverride(violationId: string, reason: string) {
    const violation = await this.prisma.riskViolation.findUnique({
      where: { id: violationId },
      include: { account: true },
    });

    if (!violation) {
      throw new NotFoundException('Risk violation record not found');
    }

    // Restore account to Active status
    await this.prisma.tradingAccount.update({
      where: { id: violation.accountId },
      data: { status: 'ACTIVE' },
    });

    if (violation.account.purchaseId) {
      await this.prisma.challengePurchase.update({
        where: { id: violation.account.purchaseId },
        data: { status: 'ACTIVE' },
      });
    }

    // Delete violation record (soft delete handles this)
    await this.prisma.riskViolation.delete({
      where: { id: violationId },
    });

    return {
      message: 'Violation overridden. Trading account status has been restored to active.',
      accountId: violation.accountId,
    };
  }
}
