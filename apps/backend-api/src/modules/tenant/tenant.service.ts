import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async getBranding(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: slug.toLowerCase() },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        customDomain: true,
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with slug '${slug}' not found`);
    }

    return org;
  }

  async updateBranding(orgId: string, dto: UpdateBrandingDto) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        customDomain: dto.customDomain,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        customDomain: true,
      },
    });
  }

  async getSettings(orgId: string) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { orgId },
    });

    if (!settings) {
      // Create default settings if not exists
      return this.prisma.tenantSettings.create({
        data: {
          orgId,
          stripeConfig: {},
          cryptoConfig: {},
          emailTemplates: {},
          riskConfig: {},
        },
      });
    }

    return settings;
  }

  async updateSettings(orgId: string, dto: UpdateSettingsDto) {
    const existing = await this.getSettings(orgId);

    return this.prisma.tenantSettings.update({
      where: { id: existing.id },
      data: {
        stripeConfig: dto.stripeConfig !== undefined ? dto.stripeConfig : undefined,
        cryptoConfig: dto.cryptoConfig !== undefined ? dto.cryptoConfig : undefined,
        emailTemplates: dto.emailTemplates !== undefined ? dto.emailTemplates : undefined,
        riskConfig: dto.riskConfig !== undefined ? dto.riskConfig : undefined,
      },
    });
  }
}
