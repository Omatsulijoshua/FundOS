import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;
    const user = request.user;

    if (!tenant) {
      throw new BadRequestException('Tenant context is missing. Cannot verify membership.');
    }

    if (!user) {
      throw new ForbiddenException('User session is missing. Please authenticate.');
    }

    // Query organization membership
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId: tenant.id,
          userId: user.id,
        },
      },
      select: {
        id: true,
        orgId: true,
        userId: true,
        role: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException(`You are not a member of the organization '${tenant.name}'`);
    }

    // Attach membership to request for downstream roles validation
    request.member = membership;

    return true;
  }
}
