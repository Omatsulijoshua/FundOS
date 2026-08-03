import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: { enabled: true }, description: 'Stripe configuration credentials' })
  @IsObject()
  @IsOptional()
  stripeConfig?: Record<string, any>;

  @ApiPropertyOptional({ example: { enabled: true }, description: 'Crypto wallet payment credentials' })
  @IsObject()
  @IsOptional()
  cryptoConfig?: Record<string, any>;

  @ApiPropertyOptional({ example: { welcome: 'Welcome!' }, description: 'Custom email styling and content templates' })
  @IsObject()
  @IsOptional()
  emailTemplates?: Record<string, any>;

  @ApiPropertyOptional({ example: { maxLeverageAllowed: 100 }, description: 'Tenant-specific fraud and risk rules configs' })
  @IsObject()
  @IsOptional()
  riskConfig?: Record<string, any>;
}
