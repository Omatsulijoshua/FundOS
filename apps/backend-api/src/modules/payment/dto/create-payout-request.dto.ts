import { IsNumber, IsEnum, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PayoutMethodEnum {
  BANK_WIRE = 'BANK_WIRE',
  CRYPTO = 'CRYPTO',
  DEEL = 'DEEL',
  PAYPAL = 'PAYPAL',
}

export class CreatePayoutRequestDto {
  @ApiProperty({ example: 500.00, description: 'Requested payout amount value' })
  @IsNumber()
  @Min(50) // Minimum payout amount
  amount: number;

  @ApiProperty({ example: 'CRYPTO', enum: PayoutMethodEnum, description: 'Selected payout delivery method' })
  @IsEnum(PayoutMethodEnum)
  method: PayoutMethodEnum;

  @ApiProperty({ example: 'USDT-TRC20 Wallet Address: TXxyz...', description: 'Details including bank IBAN or crypto wallet address' })
  @IsString()
  payoutDetails: string;
}
