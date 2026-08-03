import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TradingPlatformEnum {
  MT5 = 'MT5',
  CTRADER = 'CTRADER',
  DXTRADE = 'DXTRADE',
}

export enum PaymentMethodEnum {
  STRIPE = 'STRIPE',
  CRYPTO = 'CRYPTO',
  WALLET = 'WALLET',
}

export class PurchaseChallengeDto {
  @ApiProperty({ example: 'MT5', enum: TradingPlatformEnum, description: 'Target broker trading platform' })
  @IsEnum(TradingPlatformEnum)
  platform: TradingPlatformEnum;

  @ApiProperty({ example: 'STRIPE', enum: PaymentMethodEnum, description: 'Selected checkout payment method' })
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;
}
