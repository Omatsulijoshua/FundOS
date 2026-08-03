import { IsString, IsNumber, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER20', description: 'Unique promotional discount code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 20.00, description: 'Discount percentage value' })
  @IsNumber()
  @Min(1)
  @Max(90)
  discountPct: number;

  @ApiProperty({ example: '2026-08-31T23:59:59.000Z', description: 'Expiry timestamp', required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiProperty({ example: 'affiliate-uuid-1234', description: 'Affiliate account reference ID', required: false })
  @IsString()
  @IsOptional()
  affiliateId?: string;
}
