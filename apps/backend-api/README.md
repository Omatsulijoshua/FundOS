# FundOS Backend API Gateway

The core transactional engine and API Gateway for the FundOS multi-tenant SaaS platform, built on NestJS + Prisma ORM.

---

## 🏗️ Architecture Foundation (Milestone 4)

We have established the core micro-monolith framework and global request/response lifecycle interceptors.

```
[Request]
   │
   ▼
[ValidationPipe] ──► (Verify DTO attributes using class-validator)
   │
   ▼
[Route Handler (Controller)]
   │
   ▼
[TransformInterceptor] ──► (Wrap output: { success: true, data: ..., timestamp })
   │
   ▼
[Response] Or [AllExceptionsFilter] (if Error occurs) ──► (Wrap error)
```

### Key Pillars

1. **Environment Config Validation (`src/config/env.validation.ts`)**
   - Implements strong-typed runtime environment parsing using `class-validator`.
   - Prevents bootup if critical variables (such as `DATABASE_URL`) are missing or incorrectly formatted.

2. **Unified Response Interceptor (`src/common/interceptors/transform.interceptor.ts`)**
   - Automatically wraps successful controller responses inside a `{ success: true, data: ..., timestamp }` structure to guarantee client API predictability.

3. **Global Exception Boundary (`src/common/filters/http-exception.filter.ts`)**
   - Intercepts all runtime exceptions.
   - Formats them into standard JSON structures, hiding stack details on production and preserving them in development logs.

4. **Interactive Swagger Docs (`/api/docs`)**
   - Generates dynamic OpenAPI 3.0 specs.
   - Provides an interactive developer playground directly in the browser to execute API calls.

5. **Operational Health Monitoring (`/health`)**
   - Performs a quick raw check against PostgreSQL to confirm DB engine responsiveness and returns service statuses.

6. **Authentication & Session Manager (`src/modules/auth/`)** (Phase 5)
   - **Local Email Signups**: Creates user records, hashes passwords with salt cycles using `bcryptjs`.
   - **JWT Tokens Flow**: Issues short-lived access tokens (15m) and long-lived refresh tokens (7d).
   - **HTTP-Only Cookies**: Automatically sets tokens on response cookies (with `httpOnly: true`, `sameSite: 'strict'`, `secure: false` for local dev) to prevent cross-site scripting (XSS) attacks.
   - **Bearer Tokens Fallback**: Extracts authorization headers from mobile API requests when cookies are absent.
   - **Two-Factor Authentication (2FA)**: Generates random TOTP shared secrets, builds QR codes via data URLs, verifies confirmation codes, and enforces verification on subsequent logins.
   - **Rotate & Clear Sessions**: Revokes sessions dynamically on logout and rotates tokens on session refresh.

7. **Multi-Tenancy Context & Guards (`src/common/middleware/`, `src/modules/tenant/`)** (Phase 6)
   - **Dynamic Context Parsing**: `TenantMiddleware` extracts the tenant slug from either custom headers (`x-tenant-slug`) or subdomains from custom host headers, querying the database to fetch active organization states. It automatically skips localhost/IP mappings to prevent dev environment routing collisions.
   - **Tenant Context Decorator**: `@CurrentTenant()` parameter decorator to directly inject the active tenant object into controller parameters.
   - **Membership Lock (`TenantMemberGuard`)**: Verifies that the authenticated JWT user is a registered member of the resolved tenant organization.
   - **Role-Based Access Control (`RolesGuard`)**: Checks membership roles (e.g. `ORG_ADMIN`, `TRADER`, `SUPPORT_AGENT`) against endpoints annotated with the `@Roles()` decorator.
   - **Dynamic Branding API**: Exposes endpoints (`GET /tenant/branding`) to pull colors/logos dynamically, and admin endpoints (`PATCH /tenant/settings`, `PATCH /tenant/branding`) to customize payment configurations, custom domains, and risk limits.

8. **Challenge Orchestration & Rules Evaluation Engine (`src/modules/challenge/`)** (Phase 9)
   - **Challenge Preset Queries**: Dynamic filters allowing traders to query valid challenge packages configured by their firm.
   - **Simulated Accounts Provisioning**: Auto-generates unique simulated account numbers and secure passwords for MetaTrader 5 or cTrader upon challenge checkouts.
   - **Ledger Transactions Recording**: Automatically writes database transaction records and deducts payments from user wallets to enforce billing tracking.
   - **Real-Time Drawdown & Profit Checks**: Evaluates equity fluctuations against strict limits (such as daily drawdown percentage, maximum overall drawdown, target profit milestones, and minimum unique trading days).
   - **Automatic Phase Progression**: Frozen accounts that violate rules are marked `VIOLATED`. Accounts that pass successfully are marked `ARCHIVED`, triggering automated progressions from Phase 1 to Phase 2, and Phase 2 to Funded.

9. **Trading Platform Integrations & Webhooks (`src/modules/integration/`)** (Phase 10)
   - **Simulated Broker API bridges**: Mimics connections to external MT5 WebAPI managers and cTrader OpenAPI gateways to configure simulated accounts.
   - **Emergency Auto-Close Lock**: Automatically fires emergency HTTP calls to close all active exposure on the broker server if an equity rule is violated.
   - **Real-Time Trade Webhooks**: Exposes endpoints (`POST /integrations/webhooks/:provider` where provider can be `mt5`, `ctrader`, or `dxtrade`) to receive orders execution, position details, and balance modifications.
   - **Balance & Equity Synchronization**: Syncs trade volume, asset symbols, ticket prices, and net profits instantly, updating internal trading account balance ledgers and executing rule audits.

10. **Risk and Fraud Analysis Engine (`src/modules/risk/`)** (Phase 11)
    - **Advanced Hedging Check**: Verifies that traders do not maintain concurrent opposing trades (BUY & SELL) on the same asset.
    - **Sizing Spike Lock**: Flags trades with volumes exceeding 3.5x the average volume of past trades to prevent leverage abuse.
    - **Behavioral Risk Scoring**: Algorithmic scoring evaluating historical win rates, profit factors, and revenge trading tendencies (trades opened within 10 minutes of a loss), caching values in `RiskScore` logs.
    - **Suspension Enforcement**: Restricts rule-breaking accounts by shifting status to `VIOLATED`, flagging `ChallengePurchase` as `FAILED`, and writing metadata logs.
    - **Admin Overrides Controller**: Allows authorized organization managers to delete violations, restore accounts to `ACTIVE`, and re-authorize trading actions.

11. **Payments processing & Payouts Engine (`src/modules/payment/`)** (Phase 12)
    - **Stripe Checkout Sessions**: Generates customized checkout forms redirecting users to secure Stripe portals using tenant custom API keys or falling back to local sandbox redirect URLs for testing.
    - **Trader Payout requests**: Allows funded traders to request withdrawals from their USD wallets (supporting BANK_WIRE, CRYPTO, DEEL, and PAYPAL methods), validating and locking requested balances.
    - **Administrative Payout control**: Exposes interfaces for managers to audit pending withdrawals, release payouts, log transactions, and reject requests (restoring locked balances).
    - **Checkout Session Callback Webhooks**: Standard listeners to capture Stripe transaction states, verify challenge purchases, and trigger automated MT5/cTrader simulated credentials provisioning.

12. **Affiliate Partner & Discount Coupons Engine (`src/modules/affiliate/`)** (Phase 13)
    - **Partner Opt-in Program**: Enables members to register as affiliates, generating a unique referral code and tracking link.
    - **Referral Commission Tracking**: Automatically scans referral identifiers and calculates payouts (defaulting to a 10% rate) to compile unpaid/paid commission histories.
    - **Performance Metrics portal**: Returns real-time aggregate statistics for partner portals, summarizing total link clicks, user registrations, conversion rates, and earnings.
    - **Discount Code validation**: Allows administrators to configure custom promo codes (`Coupon` model) supporting expiry dates and custom discount percentages.

13. **Trading Performance Analytics Engine (`src/modules/analytics/`)** (Phase 14)
    - **Advanced Metrics Calculator**: Computes performance statistics including overall Win Rate, Profit Factor, Average Trade Gain/Loss, Standard Deviation, and trade durations.
    - **Trade-based Sharpe Ratio**: Dynamically assesses risk-adjusted returns based on execution returns volatility scaled against historical benchmarks.
    - **Historical Equity Curve Reconstruction**: Iterates over account trades sorted chronologically, generating a precise cumulative balance curve mapping equity fluctuations without requiring additional database tables.

14. **AI-powered Trading Coach & Advisor (`src/modules/ai/`)** (Phase 15)
    - **Dynamic Behavioral Coaching Summary**: Audits actual trader execution tables, warning users of cognitive biases (like revenge trading inside 10 minutes or lot sizing spikes) and offering customized strengths analysis.
    - **Trade Recommendations & Market Sentiment**: Simulates algorithmic trade setups and market trends analysis (EURUSD, GBPUSD, XAUUSD) with confidence ratings and entry/exit levels.
    - **Interactive NLP Coaching Chat**: Conversational interface enabling traders to ask questions about risk rules, psychology management, or leverage limits, with context-aware responses.

---

## 🚀 Running Locally

### 1. Launch Services (Docker)
Start the PostgreSQL (`5435`) and Redis (`6382`) containers:
```bash
docker compose up -d
```

### 2. Install Workspaces
From the monorepo root:
```bash
pnpm install
```

### 3. Generate Client & Run Seeds
```bash
pnpm --filter backend-api exec prisma migrate dev
pnpm --filter backend-api exec prisma db seed
```

### 4. Start Development Server
```bash
pnpm --filter backend-api run start:dev
```
- API Gateway Endpoint: `http://localhost:3001/api/v1`
- Health Endpoint: `http://localhost:3001/health`
- Swagger Playground: `http://localhost:3001/api/docs`

---

## 🧪 Testing

We run unit tests and End-to-End (E2E) integration tests using Jest.

### Run Unit Tests
```bash
pnpm --filter backend-api test
```

### Run End-to-End Tests
Ensure your local PostgreSQL container is running, then run:
```bash
pnpm --filter backend-api run test:e2e
```
