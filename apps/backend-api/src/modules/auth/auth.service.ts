import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { generateSecret, verifySync, generateURI } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Create default USD wallet for user
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        currency: 'USD',
        balance: 0.00,
      },
    });

    return user;
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Two-factor authentication check
    if (user.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return {
          twoFactorRequired: true,
          userId: user.id,
          message: 'Please provide two-factor authentication code',
        };
      }
      const secret = user.twoFactorSecret;
      if (!secret) {
        throw new BadRequestException('Two-factor secret is not configured');
      }
      const verified = verifySync({
        token: dto.twoFactorCode,
        secret,
      });
      if (!verified) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Save refresh session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    // Track login audit
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityName: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return {
      twoFactorRequired: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
    });

    if (session) {
      await this.prisma.userSession.delete({
        where: { id: session.id },
      });
      
      await this.prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'USER_LOGOUT',
          entityName: 'UserSession',
          entityId: session.id,
        },
      });
    }

    return { message: 'Logout successful' };
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.userSession.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedException('Session expired or invalid. Please login again.');
    }

    // Rotate refresh token
    const tokens = await this.generateTokens(session.user.id, session.user.email);

    // Update session record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return tokens;
  }

  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'FundOS',
      label: user.email,
      secret,
    });

    // Store temporary secret until verified
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async enable2fa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor setup has not been initialized');
    }

    const verified = verifySync({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid two-factor confirmation code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ENABLE_2FA',
        entityName: 'User',
        entityId: userId,
      },
    });

    return { message: 'Two-factor authentication successfully enabled' };
  }

  async disable2fa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor authentication is not active');
    }

    const verified = verifySync({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DISABLE_2FA',
        entityName: 'User',
        entityId: userId,
      },
    });

    return { message: 'Two-factor authentication successfully disabled' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    const secret = this.configService.get<string>('JWT_SECRET') || 'fundos_default_secret_key_2026_change_in_prod';

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
