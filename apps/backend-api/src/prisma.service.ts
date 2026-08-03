import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    // Soft Delete & Tenant Isolation Middleware
    this.$use(async (params, next) => {
      const modelsWithSoftDelete = ['User', 'Organization', 'Challenge'];

      if (params.model && modelsWithSoftDelete.includes(params.model)) {
        // Intercept single reads
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args.where = { ...params.args.where, deletedAt: null };
        }

        // Intercept lists reads
        if (params.action === 'findMany') {
          if (!params.args) params.args = {};
          if (params.args.where) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where.deletedAt = null;
            }
          } else {
            params.args.where = { deletedAt: null };
          }
        }

        // Intercept updates
        if (params.action === 'update') {
          params.args.where = { ...params.args.where, deletedAt: null };
        }
        if (params.action === 'updateMany') {
          if (!params.args) params.args = {};
          if (params.args.where) {
            params.args.where = { ...params.args.where, deletedAt: null };
          } else {
            params.args.where = { deletedAt: null };
          }
        }

        // Intercept single delete -> Convert to Soft Delete update
        if (params.action === 'delete') {
          params.action = 'update';
          params.args.data = { deletedAt: new Date() };
        }

        // Intercept bulk delete -> Convert to Soft Delete updateMany
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (!params.args) params.args = {};
          params.args.data = { deletedAt: new Date() };
        }
      }

      return next(params);
    });
  }
}
