# FundOS Database Architecture (Prisma & PostgreSQL)

This directory contains the database design schemas, migrations, and seed scripts.

---

## 🛠️ Infrastructure Setup

We run our PostgreSQL database and Redis backend services locally via Docker Compose.

- **PostgreSQL**: Bound to host port `5435` (to avoid conflicts with standard postgres containers).
- **Redis**: Bound to host port `6382` (used by BullMQ queue systems).

To start the database:
```bash
docker compose up -d
```

---

## 📐 Schema Relations & Design

We leverage a shared database model with strict tenant isolation. The schema is defined in `prisma.schema`.

### Primary Entities

1. **Multi-Tenancy**
   - `Organization`: Represents a white-label prop firm. Contains custom domains, branding configs, and subscription states.
   - `TenantSettings`: Encrypted payment processing API keys (Stripe, wallets) and custom layouts configurations.
   - `OrganizationMember`: Maps a `User` to an `Organization` with a specific role (`ORG_ADMIN`, `TRADER`, `SUPPORT_AGENT`, etc.).

2. **Core Trading Elements**
   - `Challenge`: Configures valuation parameters (profit targets, daily drawdown, rules, pricing).
   - `ChallengePurchase`: Tracks active trader challenges and phase lifecycles.
   - `TradingAccount`: Broker account credentials (MT5, cTrader) and active risk limits.
   - `Trade` & `Position`: Core execution ledgers capturing volumes, magic numbers, commissions, and profits.

3. **Risk & Financials**
   - `RiskViolation`: Records daily/max drawdown triggers or rule failures.
   - `RiskScore`: Multi-dimensional metrics (consistency, revenge trading, win rates) calculated in time windows.
   - `Wallet`, `Transaction`, `Withdrawal`: In-app treasury balances and payout processing logs.

---

## 🗑️ Soft Delete Implementation

Soft delete is handled transparently inside the `PrismaService` (`src/prisma.service.ts`) using Prisma middleware. When calling `delete` or `deleteMany` on soft-deletable models (`User`, `Organization`, `Challenge`), the query is intercepted and rewritten to update `deletedAt` with a timestamp:
```typescript
// Query rewrite example:
prisma.user.delete({ where: { id: "..." } })
// becomes:
prisma.user.update({ where: { id: "..." }, data: { deletedAt: new Date() } })
```
All read queries (`findMany`, `findFirst`, `findUnique`) automatically filter out deleted records unless explicitly bypassed.

---

## 🔄 Commands Quick Reference

### Run Migrations
Generate and apply schema changes to PostgreSQL:
```bash
pnpm --filter backend-api exec prisma migrate dev --name init
```

### Seed Database
Populate database with mock developers/traders/organizations:
```bash
pnpm --filter backend-api exec prisma db seed
```

### Reset Database
Wipe all data and run all migrations and seeds from scratch:
```bash
pnpm --filter backend-api exec prisma migrate reset
```
