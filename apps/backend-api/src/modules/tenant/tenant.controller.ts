import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMemberGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { SystemRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('Tenants')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('branding')
  @ApiOperation({ summary: 'Get public branding setup for custom styling' })
  @ApiHeader({ name: 'x-tenant-slug', required: false, description: 'Slug of the prop firm' })
  async getBranding(
    @Query('slug') querySlug?: string,
    @Req() req?: any
  ) {
    // Resolve slug from query or fall back to request tenant header
    const slug = querySlug || req?.tenant?.slug;
    if (!slug) {
      throw new BadRequestException(
        'Please provide a tenant slug query parameter (?slug=...) or specify x-tenant-slug header.'
      );
    }
    return this.tenantService.getBranding(slug);
  }

  @Patch('branding')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update prop firm branding variables' })
  async updateBranding(
    @CurrentTenant() tenant: any,
    @Body() dto: UpdateBrandingDto
  ) {
    return this.tenantService.updateBranding(tenant.id, dto);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get custom payment gateways and email structures' })
  async getSettings(@CurrentTenant() tenant: any) {
    return this.tenantService.getSettings(tenant.id);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard, TenantMemberGuard, RolesGuard)
  @Roles(SystemRole.ORG_ADMIN, SystemRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom payment gateways and email structures' })
  async updateSettings(
    @CurrentTenant() tenant: any,
    @Body() dto: UpdateSettingsDto
  ) {
    return this.tenantService.updateSettings(tenant.id, dto);
  }
}
