import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('webhooks/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook endpoint to receive live trade events from MetaTrader 5 or cTrader' })
  @ApiResponse({ status: 200, description: 'Trade processed and account rules evaluated successfully' })
  @ApiResponse({ status: 404, description: 'Trading account not found' })
  async handleTradeWebhook(
    @Param('provider') provider: string,
    @Body() dto: WebhookEventDto
  ) {
    // Validate supported providers
    const normalizedProvider = provider.toLowerCase();
    if (!['mt5', 'ctrader', 'dxtrade'].includes(normalizedProvider)) {
      throw new BadRequestException(`Provider '${provider}' is not supported for integrations`);
    }

    return this.integrationService.processTradeWebhook(dto);
  }
}
