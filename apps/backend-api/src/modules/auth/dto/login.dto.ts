import { IsEmail, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'trader@example.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123', description: 'User password' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: '123456', description: 'One-time 2FA OTP code' })
  @IsString()
  @IsOptional()
  @Length(6, 6)
  twoFactorCode?: string;
}
