import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ChallengeService } from '../challenge/challenge.service';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly challengeService: ChallengeService
  ) {}

  async createExternalAccount(login: string, platform: string) {
    // Simulating external HTTP call to MT5 WebAPI or cTrader openAPI Gateway
    console.log(`[IntegrationService] Provisioned simulated account ${login} on ${platform}`);
    return {
      success: true,
      externalAccountId: `EXT_${login}`,
      status: 'PROVISIONED',
    };
  }

  async closeAllPositions(login: string) {
    // Simulating emergency risk management API call to close all open exposure on MT5 / cTrader
    console.log(`[IntegrationService] EMERGENCY LOCK - Closed all active positions for account ${login}`);
    return {
      success: true,
      closedPositionsCount: 3,
      marginReleased: 1450.00,
    };
  }

  async processTradeWebhook(dto: WebhookEventDto) {
    // 1. Resolve trading account by broker login
    const account = await this.prisma.tradingAccount.findUnique({
      where: { login: dto.login },
    });

    if (!account) {
      throw new NotFoundException(`Trading account with login '${dto.login}' not found in FundOS`);
    }

    if (account.status === 'VIOLATED' || account.status === 'ARCHIVED') {
      throw new BadRequestException(`Trading account is currently inactive (status: ${account.status})`);
    }

    // 2. Write trade execution record under local database
    const parsedVolume = dto.volume;
    const parsedPrice = dto.price;
    const parsedProfit = dto.profit;

    const trade = await this.prisma.trade.create({
      data: {
        accountId: account.id,
        ticketId: dto.ticketId,
        symbol: dto.symbol,
        volume: parsedVolume,
        type: dto.type,
        openPrice: parsedPrice,
        closePrice: parsedPrice, // Simulating single execution record
        openTime: new Date(dto.timestamp),
        profit: parsedProfit,
        commission: 0.00,
        swap: 0.00,
        createdAt: new Date(dto.timestamp),
      },
    });

    // 3. Update account balance and equity
    const newBalance = account.balance.toNumber() + dto.profit;
    const updatedAccount = await this.prisma.tradingAccount.update({
      where: { id: account.id },
      data: {
        balance: newBalance,
        equity: newBalance, // Simulating closed trade equity sync
      },
    });

    // 4. Trigger Challenge Rules Evaluation check
    const evaluation = await this.challengeService.evaluateAccountRules(account.id);

    // 5. Emergency lock positions if rules evaluation marked the account as violated
    if (evaluation.status === 'VIOLATED') {
      await this.closeAllPositions(account.login);
    }

    return {
      tradeId: trade.id,
      login: dto.login,
      previousBalance: account.balance,
      newBalance: updatedAccount.balance,
      evaluation,
    };
  }
}
