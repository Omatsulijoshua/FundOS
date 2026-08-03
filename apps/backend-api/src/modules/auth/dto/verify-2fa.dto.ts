import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2faDto {
  @ApiProperty({ example: '123456', description: '6-digit OTP code from authenticator app' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
