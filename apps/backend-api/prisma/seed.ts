import { PrismaClient, SystemRole, TenantStatus, ChallengeStatus, AccountStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing database records
  await prisma.auditLog.deleteMany({});
  await prisma.ticketMessage.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.riskViolation.deleteMany({});
  await prisma.riskScore.deleteMany({});
  await prisma.trade.deleteMany({});
  await prisma.position.deleteMany({});
  await prisma.tradingAccount.deleteMany({});
  await prisma.tradingPlatform.deleteMany({});
  await prisma.challengePurchase.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.affiliateCommission.deleteMany({});
  await prisma.affiliate.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.kycDocument.deleteMany({});
  await prisma.kycDetail.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.tenantSettings.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Database cleared.');

  // 2. Create Users
  console.log('👥 Creating users...');
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@fundos.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx1234567890', // mock bcrypt hash
      firstName: 'Alex',
      lastName: 'Super',
      isVerified: true,
    },
  });

  const propOwnerUser = await prisma.user.create({
    data: {
      email: 'owner@apex-funding.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx1234567890',
      firstName: 'John',
      lastName: 'Apex',
      isVerified: true,
    },
  });

  const trader1 = await prisma.user.create({
    data: {
      email: 'trader1@gmail.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx1234567890',
      firstName: 'David',
      lastName: 'Trader',
      isVerified: true,
    },
  });

  const trader2 = await prisma.user.create({
    data: {
      email: 'trader2@gmail.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx1234567890',
      firstName: 'Sarah',
      lastName: 'Scalper',
      isVerified: true,
    },
  });

  // 3. Create Organization
  console.log('🏢 Creating Organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'Apex Funding Group',
      slug: 'apex-funding',
      customDomain: 'apex-funding.com',
      status: TenantStatus.ACTIVE,
      primaryColor: '#0F172A',
      secondaryColor: '#3B82F6',
    },
  });

  // 4. Create Tenant Settings
  await prisma.tenantSettings.create({
    data: {
      orgId: org.id,
      stripeConfig: { enabled: true, mode: 'test' },
      cryptoConfig: { enabled: true, network: 'ERC20' },
      riskConfig: { maxLeverageAllowed: 100, enforceDailyDrawdown: true },
    },
  });

  // 5. Add Members to Organization
  await prisma.organizationMember.createMany({
    data: [
      {
        orgId: org.id,
        userId: propOwnerUser.id,
        role: SystemRole.ORG_ADMIN,
      },
      {
        orgId: org.id,
        userId: trader1.id,
        role: SystemRole.TRADER,
      },
      {
        orgId: org.id,
        userId: trader2.id,
        role: SystemRole.TRADER,
      },
    ],
  });

  // 6. Create Wallets for Traders
  await prisma.wallet.createMany({
    data: [
      { userId: trader1.id, currency: 'USD', balance: 500.00 },
      { userId: trader2.id, currency: 'USD', balance: 1200.00 },
    ],
  });

  // 7. Create Challenges
  console.log('🏆 Creating Challenges...');
  const challenge10k = await prisma.challenge.create({
    data: {
      orgId: org.id,
      name: '$10,000 Starter Evaluation',
      price: 99.00,
      currency: 'USD',
      leverage: '1:100',
      profitTargetPct: 10.00,
      dailyDrawdownPct: 5.00,
      maxDrawdownPct: 10.00,
      minTradingDays: 5,
      durationDays: 30,
      newsTradingRestr: false,
      weekendHolding: false,
      copyTradingRestr: true,
    },
  });

  const challenge100k = await prisma.challenge.create({
    data: {
      orgId: org.id,
      name: '$100,000 Master Evaluation',
      price: 549.00,
      currency: 'USD',
      leverage: '1:100',
      profitTargetPct: 8.00,
      dailyDrawdownPct: 5.00,
      maxDrawdownPct: 10.00,
      minTradingDays: 5,
      durationDays: 30,
      newsTradingRestr: true,
      weekendHolding: true,
      copyTradingRestr: true,
    },
  });

  // 8. Create Trading Platforms
  console.log('💻 Creating Platforms...');
  const mt5 = await prisma.tradingPlatform.create({
    data: {
      name: 'MetaTrader 5',
      version: '5.0',
      apiUrl: 'https://mt5-bridge.fundos.com/api',
      isActive: true,
    },
  });

  const ctrader = await prisma.tradingPlatform.create({
    data: {
      name: 'cTrader',
      version: '2.0',
      apiUrl: 'https://ctrader-openapi.fundos.com',
      isActive: true,
    },
  });

  // 9. Challenge Purchases & Trading Accounts
  console.log('💳 Creating Challenge Purchases and Accounts...');
  const purchase1 = await prisma.challengePurchase.create({
    data: {
      challengeId: challenge10k.id,
      traderId: trader1.id,
      status: ChallengeStatus.ACTIVE,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const account1 = await prisma.tradingAccount.create({
    data: {
      orgId: org.id,
      purchaseId: purchase1.id,
      platformId: mt5.id,
      login: '1029482',
      password: 'encrypted_mt5_pass_xyz',
      serverName: 'Apex-Server-MT5',
      balance: 10000.00,
      equity: 10000.00,
      startingBalance: 10000.00,
      maxDailyDrawdownLimit: 9500.00, // 5% daily limit
      maxDrawdownLimit: 9000.00,      // 10% max limit
      status: AccountStatus.ACTIVE,
    },
  });

  // Sample trades for Account 1
  await prisma.trade.createMany({
    data: [
      {
        accountId: account1.id,
        ticketId: 'TRD_982734',
        symbol: 'EURUSD',
        volume: 1.00,
        type: 'BUY',
        openPrice: 1.08500,
        closePrice: 1.08750,
        openTime: new Date(Date.now() - 2 * 3600 * 1000),
        closeTime: new Date(Date.now() - 1 * 3600 * 1000),
        profit: 250.00,
        swap: 0.00,
        commission: -6.00,
      },
      {
        accountId: account1.id,
        ticketId: 'TRD_982735',
        symbol: 'GBPUSD',
        volume: 0.50,
        type: 'SELL',
        openPrice: 1.26400,
        closePrice: 1.26100,
        openTime: new Date(Date.now() - 30 * 60 * 1000),
        closeTime: new Date(),
        profit: 150.00,
        swap: 0.00,
        commission: -3.00,
      },
    ],
  });

  // Calculate new balance based on trades
  await prisma.tradingAccount.update({
    where: { id: account1.id },
    data: {
      balance: 10391.00, // startingBalance + profits + commissions
      equity: 10391.00,
    },
  });

  // Risk Score calculation
  await prisma.riskScore.create({
    data: {
      accountId: account1.id,
      score: 82, // Good consistency
      metrics: {
        winRate: 100,
        profitFactor: 50,
        maxDrawdownRecordedPct: 0.0,
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: trader1.id,
      action: 'CHALLENGE_PURCHASED',
      entityName: 'ChallengePurchase',
      entityId: purchase1.id,
      newData: { challengeId: challenge10k.id, price: 99.00 },
    },
  });

  console.log('✅ Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
