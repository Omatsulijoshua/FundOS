import { IsString, IsHexColor, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandingDto {
  @ApiPropertyOptional({ example: 'Apex Funding Group', description: 'Display name of the prop firm' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'https://apex-funding.com/logo.png', description: 'Logo image URL' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#0F172A', description: 'Hex code for primary branding color' })
  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#3B82F6', description: 'Hex code for secondary branding color' })
  @IsHexColor()
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: 'funding.apex-trading.com', description: 'Custom domain alias name' })
  @IsString()
  @IsOptional()
  customDomain?: string;
}
