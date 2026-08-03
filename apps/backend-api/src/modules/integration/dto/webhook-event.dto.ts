import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TradeTypeEnum {
  BUY = 'BUY',
  SELL = 'SELL',
  BALANCE = 'BALANCE',
}

export class WebhookEventDto {
  @ApiProperty({ example: '1029482', description: 'Trading account login number' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'TRD_994820', description: 'External broker ticket ID' })
  @IsString()
  ticketId: string;

  @ApiProperty({ example: 'EURUSD', description: 'Symbol asset class' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'BUY', enum: TradeTypeEnum, description: 'Transaction type' })
  @IsEnum(TradeTypeEnum)
  type: TradeTypeEnum;

  @ApiProperty({ example: 1.0, description: 'Lot size volume' })
  @IsNumber()
  volume: number;

  @ApiProperty({ example: 1.08450, description: 'Execution price' })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 150.00, description: 'Net trade profit or loss value' })
  @IsNumber()
  profit: number;

  @ApiProperty({ example: '2026-08-03T02:00:00.000Z', description: 'Execution timestamp' })
  @IsString()
  timestamp: string;
}
