import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { TradingPlatformEnum, PaymentMethodEnum } from '../src/modules/challenge/dto/purchase-challenge.dto';

describe('Trader Complete Flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authToken: string;
  let testUser: any;
  let orgId: string;
  let challengeId: string;
  let accountId: string;
  let payoutId: string;

  const testEmail = 'testtrader_e2e@gmail.com';
  const testPassword = 'Password123!';

  const cleanupUser = async (email: string) => {
    console.log('CLEANING UP USER (RAW SQL):', email);
    try {
      const user = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM "User" WHERE email = $1`,
        email.toLowerCase()
      );
      if (!user || user.length === 0) {
        console.log('NO USER FOUND VIA RAW SQL FOR:', email);
        return;
      }
      const userId = user[0].id;
      console.log('FOUND USER ID FOR RAW DELETE:', userId);

      // Delete dependents
      await prisma.$executeRawUnsafe(
        `DELETE FROM "TradingAccount" WHERE "purchaseId" IN (
          SELECT id FROM "ChallengePurchase" WHERE "traderId" IN (
            SELECT id FROM "OrganizationMember" WHERE "userId" = $1
          )
        )`,
        userId
      ).catch(e => console.error('d1 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "ChallengePurchase" WHERE "traderId" IN (
          SELECT id FROM "OrganizationMember" WHERE "userId" = $1
        )`,
        userId
      ).catch(e => console.error('d2 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "OrganizationMember" WHERE "userId" = $1`,
        userId
      ).catch(e => console.error('d3 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "Withdrawal" WHERE "walletId" IN (
          SELECT id FROM "Wallet" WHERE "userId" = $1
        )`,
        userId
      ).catch(e => console.error('d4 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "Transaction" WHERE "walletId" IN (
          SELECT id FROM "Wallet" WHERE "userId" = $1
        )`,
        userId
      ).catch(e => console.error('d5 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "Wallet" WHERE "userId" = $1`,
        userId
      ).catch(e => console.error('d6 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "UserSession" WHERE "userId" = $1`,
        userId
      ).catch(e => console.error('d7 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "KycDetail" WHERE "userId" = $1`,
        userId
      ).catch(e => console.error('d8 err', e));

      await prisma.$executeRawUnsafe(
        `DELETE FROM "AuditLog" WHERE "userId" = $1`,
        userId
      ).catch(e => console.error('d9 err', e));

      const dUser = await prisma.$executeRawUnsafe(
        `DELETE FROM "User" WHERE id = $1`,
        userId
      );
      console.log('HARD DELETED USER RESULT:', dUser);
    } catch (err) {
      console.error('ERROR IN RAW CLEANUP:', err);
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // 1. Cleanup old test data
    await cleanupUser(testEmail);

    // 2. Fetch seeded organization and challenge ID for checkout tests
    const org = await prisma.organization.findFirst({
      where: { slug: 'apex-funding' },
    });
    if (!org) {
      throw new Error('Apex Funding organization seed not found in database');
    }
    orgId = org.id;

    const challenge = await prisma.challenge.findFirst({
      where: { orgId },
    });
    if (!challenge) {
      throw new Error('Challenges seed not found in database');
    }
    challengeId = challenge.id;
  });

  afterAll(async () => {
    // Clean up created user database entries
    await cleanupUser(testEmail);
    await app.close();
  });

  it('1. Register new Trader', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'Trader',
      })
      .expect(201);

    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe(testEmail);
    testUser = res.body;
  });

  it('2. Authenticate and retrieve JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    authToken = res.body.accessToken;
  });

  it('3. Setup Membership Context & Fund USD Wallet', async () => {
    // Add user to the organization as TRADER
    await prisma.organizationMember.create({
      data: {
        orgId,
        userId: testUser.id,
        role: 'TRADER',
      },
    });

    // Update the default USD wallet created during registration to pre-fund it
    await prisma.wallet.update({
      where: {
        userId_currency: {
          userId: testUser.id,
          currency: 'USD',
        },
      },
      data: {
        balance: 500.00,
      },
    });

    const wallet = await prisma.wallet.findFirst({
      where: { userId: testUser.id, currency: 'USD' },
    });
    expect(wallet?.balance.toNumber()).toBe(500.00);
  });

  it('4. Get active challenges', async () => {
    const res = await request(app.getHttpServer())
      .get('/challenges')
      .set('x-tenant-slug', 'apex-funding')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('5. Purchase a Challenge evaluation', async () => {
    const res = await request(app.getHttpServer())
      .post(`/challenges/${challengeId}/purchase`)
      .set('x-tenant-slug', 'apex-funding')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        platform: TradingPlatformEnum.MT5,
        paymentMethod: PaymentMethodEnum.STRIPE,
      })
      .expect(201);

    expect(res.body).toHaveProperty('purchaseId');
    expect(res.body).toHaveProperty('account');
    expect(res.body.account).toHaveProperty('login');
    expect(res.body.account).toHaveProperty('balance');
    
    accountId = res.body.account.id;
  });

  it('6. Execute trade webhook to simulate broker execution', async () => {
    const targetAccount = await prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });
    if (!targetAccount) throw new Error('Account was not created in db');

    const res = await request(app.getHttpServer())
      .post('/integrations/webhooks/mt5')
      .send({
        login: targetAccount.login,
        ticketId: 'TKT_TEST_998',
        symbol: 'EURUSD',
        type: 'BUY',
        volume: 1.0,
        price: 1.08500,
        profit: 250.00, // profit $250
        timestamp: new Date().toISOString(),
      })
      .expect(200);

    expect(Number(res.body.newBalance)).toBe(10250); // starting 10,000 + 250
  });

  it('7. Run risk evaluation engine', async () => {
    const res = await request(app.getHttpServer())
      .post(`/risk/accounts/${accountId}/check`)
      .set('x-tenant-slug', 'apex-funding')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('8. Request payout from trader wallet', async () => {
    const res = await request(app.getHttpServer())
      .post('/payments/payout-requests')
      .set('x-tenant-slug', 'apex-funding')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 150.00,
        method: 'CRYPTO',
        payoutDetails: 'USDT Address: TX1234567890',
      })
      .expect(201);

    expect(res.body).toHaveProperty('withdrawalId');
    expect(res.body.lockedAmount).toBe(150.00);
    payoutId = res.body.withdrawalId;
  });
});
