import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccountPerformance(accountId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: { trades: true },
    });

    if (!account) {
      throw new NotFoundException(`Trading account ${accountId} not found`);
    }

    const trades = account.trades;
    const totalTrades = trades.length;

    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        stdDev: 0,
        sharpeRatio: 0,
        avgDurationMinutes: 0,
      };
    }

    const winningTrades = trades.filter((t) => t.profit.toNumber() > 0);
    const losingTrades = trades.filter((t) => t.profit.toNumber() < 0);

    const winRate = (winningTrades.length / totalTrades) * 100;

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit.toNumber(), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit.toNumber(), 0));

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit;

    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

    // Calculate profit standard deviation
    const profits = trades.map((t) => t.profit.toNumber());
    const avgProfit = profits.reduce((a, b) => a + b, 0) / totalTrades;
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - avgProfit, 2), 0) / totalTrades;
    const stdDev = Math.sqrt(variance);

    // Calculate Sharpe Ratio (Trade-based)
    const returns = trades.map((t) => t.profit.toNumber() / account.startingBalance.toNumber());
    const avgReturn = returns.reduce((a, b) => a + b, 0) / totalTrades;
    const returnVariance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / totalTrades;
    const returnStdDev = Math.sqrt(returnVariance);
    // Standard daily/annualized standard scaling
    const sharpeRatio = returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0;

    // Calculate Average Duration (mock fallback if openTime/closeTime difference not available)
    let totalDurationMs = 0;
    let validDurationCount = 0;

    for (const trade of trades) {
      if (trade.openTime && trade.closeTime) {
        const duration = trade.closeTime.getTime() - trade.openTime.getTime();
        totalDurationMs += duration;
        validDurationCount++;
      }
    }

    const avgDurationMinutes =
      validDurationCount > 0
        ? totalDurationMs / validDurationCount / (1000 * 60)
        : 45; // Default mock fallback 45 mins if not closed

    return {
      totalTrades,
      winRate: parseFloat(winRate.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      avgWin: parseFloat(avgWin.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      avgDurationMinutes: Math.round(avgDurationMinutes),
    };
  }

  async getEquityCurve(accountId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: {
        trades: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Trading account ${accountId} not found`);
    }

    const startingBalance = account.startingBalance.toNumber();
    const trades = account.trades;

    let runningBalance = startingBalance;
    const curvePoints = [
      {
        timestamp: account.createdAt,
        balance: startingBalance,
      },
    ];

    for (const trade of trades) {
      runningBalance += trade.profit.toNumber();
      curvePoints.push({
        timestamp: trade.createdAt,
        balance: parseFloat(runningBalance.toFixed(2)),
      });
    }

    return {
      accountId,
      startingBalance,
      currentBalance: account.balance.toNumber(),
      dataPointsCount: curvePoints.length,
      points: curvePoints,
    };
  }
}
