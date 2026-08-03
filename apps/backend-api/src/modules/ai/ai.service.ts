import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { RiskService } from '../risk/risk.service';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
    private readonly riskService: RiskService
  ) {}

  async getCoachSummary(accountId: string) {
    // 1. Fetch account and metrics
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Trading account ${accountId} not found`);
    }

    const performance = await this.analyticsService.getAccountPerformance(accountId);
    const scoreLog = await this.riskService.getLatestRiskScore(accountId);
    const violations = await this.riskService.getViolations(accountId);

    const riskScore = scoreLog ? scoreLog.score : 100;
    const metrics: any = scoreLog ? scoreLog.metrics : { revengeTradingPct: 0 };
    const revengeTradingPct = metrics.revengeTradingPct || 0;

    // 2. Build structured analysis feedback (LLM prompt or template-driven mapping)
    const hasRevengeTrading = revengeTradingPct > 20;
    const hasSizingSpikes = performance.stdDev > performance.avgWin * 2;
    const hasViolations = violations.length > 0;

    // Strengths
    const strengths = [];
    if (performance.winRate >= 50) {
      strengths.push(`Strong win rate of ${performance.winRate}%. You are successfully picking high-probability trades.`);
    } else {
      strengths.push(`Decent win rate. Focus on keeping your risk-to-reward ratio high to compensate.`);
    }
    if (performance.profitFactor >= 1.5) {
      strengths.push(`Excellent profit factor of ${performance.profitFactor}. Your winning trades comfortably outsize your losses.`);
    }

    // Weaknesses & Warnings
    const warnings = [];
    if (hasRevengeTrading) {
      warnings.push(`Revenge trading detected! ${revengeTradingPct}% of your trades were opened within 10 minutes of a losing trade. This indicates emotional trading.`);
    }
    if (hasSizingSpikes) {
      warnings.push(`High volume variance. Your trade standard deviation is high ($${performance.stdDev}), indicating erratic lot sizing.`);
    }
    if (hasViolations) {
      warnings.push(`Rule violations logged: You have triggered ${violations.length} risk warnings. Ensure you monitor daily limits.`);
    }

    // Recommendations
    const recommendations = [];
    if (hasRevengeTrading) {
      recommendations.push("Implement a mandatory 'cool-down' period of 30 minutes after any losing trade before opening new positions.");
    }
    if (hasSizingSpikes) {
      recommendations.push("Standardize your lot sizes. Avoid scaling up volumes suddenly to try and recover losses.");
    }
    recommendations.push("Keep your maximum daily risk to 1.5% of equity, and target a minimum risk-reward ratio of 1:2 on all setups.");

    // Simulated LLM coach response wrapper
    const welcomeText = `Hello Trader ${account.login}. I have audited your recent ${performance.totalTrades} executions. Here is your AI Coach assessment:`;
    
    return {
      accountId,
      login: account.login,
      riskScore,
      analysis: {
        summary: welcomeText,
        strengths,
        warnings,
        recommendations,
      },
    };
  }

  async getTradeRecommendations(accountId: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Trading account ${accountId} not found`);
    }

    // Simulated AI market sentiment and recommendations
    return {
      accountId,
      timestamp: new Date(),
      recommendations: [
        {
          symbol: 'EURUSD',
          sentiment: 'BULLISH',
          confidencePct: 78,
          rationale: 'Price has found strong support at the 1.0820 dynamic EMA on the 4H chart. MACD histogram is turning positive, indicating near-term upward momentum.',
          action: 'Look for BUY opportunities on pullbacks to 1.0835, targeting 1.0910 with a stop-loss below 1.0790.',
        },
        {
          symbol: 'GBPUSD',
          sentiment: 'NEUTRAL',
          confidencePct: 52,
          rationale: 'Consolidating in a tight range between 1.2680 and 1.2750. Awaiting UK GDP data releases for volatility direction.',
          action: 'Wait for a clean breakout of the range before committing capital.',
        },
        {
          symbol: 'XAUUSD',
          sentiment: 'BEARISH',
          confidencePct: 65,
          rationale: 'Gold is showing bearish divergence on the daily RSI. Institutional flow shows minor distribution near key pivot points.',
          action: 'Look for SELL opportunities on retests of resistance at $2420, targeting $2380 with a tight stop-loss.',
        },
      ],
    };
  }

  async chatWithCoach(accountId: string, userMessage: string, chatHistory: any[] = []) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException(`Trading account ${accountId} not found`);
    }

    const normalizedMsg = userMessage.toLowerCase();
    let coachReply = '';

    // Advanced local NLP pattern matching for simulated conversations
    if (normalizedMsg.includes('revenge') || normalizedMsg.includes('loss') || normalizedMsg.includes('tilt')) {
      coachReply = `Handling losses is the hardest part of trading, ${account.login}. When you lose a trade, your brain enters a fight-or-flight state, prompting you to "revenge trade" to win it back. My advice is to immediately close your charts and walk away for at least 30 minutes. Let the emotional chemical spike dissipate before you analyze the market again.`;
    } else if (normalizedMsg.includes('sizing') || normalizedMsg.includes('lot') || normalizedMsg.includes('leverage')) {
      coachReply = `Consistency in sizing is crucial for passing our challenge. You should choose a fixed risk percentage per trade (e.g. 0.5% or 1%) and adjust your lot sizes based on stop-loss distance, rather than arbitrarily entering large lots. Large lot spikes will eventually breach your daily drawdown limit.`;
    } else if (normalizedMsg.includes('daily') || normalizedMsg.includes('drawdown') || normalizedMsg.includes('limit')) {
      coachReply = `Your daily drawdown limit is calculated from the start-of-day equity. If you exceed this threshold, the account is suspended immediately. Set an alert at 80% of your daily limit so you can stop trading before reaching a hard violation.`;
    } else {
      coachReply = `I am here to help you build consistency and pass the FundOS challenge, ${account.login}. Feel free to ask me about managing trading psychology (such as revenge trading), adjusting lot sizing risk parameters, or clarifying daily drawdown compliance rules.`;
    }

    return {
      accountId,
      userMessage,
      coachReply,
      timestamp: new Date(),
    };
  }
}
