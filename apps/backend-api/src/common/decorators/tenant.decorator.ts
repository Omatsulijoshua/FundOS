import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      throw new BadRequestException('Organization tenant context could not be resolved for this request. Please specify x-tenant-slug header.');
    }

    return tenant;
  }
);
