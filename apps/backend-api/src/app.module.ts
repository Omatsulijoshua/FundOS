import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { validate } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { RiskModule } from './modules/risk/risk.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    AuthModule,
    TenantModule,
    ChallengeModule,
    IntegrationModule,
    RiskModule,
    PaymentModule,
    AffiliateModule,
    AnalyticsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
