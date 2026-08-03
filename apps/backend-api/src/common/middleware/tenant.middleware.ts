import { Injectable, NestMiddleware, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Try to read tenant from header x-tenant-slug
    let tenantSlug = req.headers['x-tenant-slug'] as string;

    // 2. Fallback to parsing subdomain from host header
    if (!tenantSlug && req.headers.host) {
      const host = req.headers.host;
      // Ignore IP addresses (e.g. 127.0.0.1, 127.0.0.1:5543) and localhost
      const isIpOrLocalhost = host.includes('localhost') || /^[0-9.:]+$/.test(host);
      
      if (!isIpOrLocalhost) {
        const parts = host.split('.');
        if (parts.length > 2) {
          // e.g. apex.fundos.com -> parts = ['apex', 'fundos', 'com'] -> tenantSlug = 'apex'
          if (parts[0] !== 'www') {
            tenantSlug = parts[0];
          }
        }
      }
    }

    if (tenantSlug) {
      const organization = await this.prisma.organization.findUnique({
        where: { slug: tenantSlug.toLowerCase() },
        select: {
          id: true,
          name: true,
          slug: true,
          customDomain: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          status: true,
        },
      });

      if (!organization) {
        throw new NotFoundException(`Prop firm organization '${tenantSlug}' not found`);
      }

      if (organization.status === 'SUSPENDED') {
        throw new BadRequestException(`Organization '${organization.name}' is suspended`);
      }

      // Attach organization to request
      (req as any).tenant = organization;
    }

    next();
  }
}
