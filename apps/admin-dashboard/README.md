# 🏢 FundOS Admin Portal

The Next.js client application for proprietary trading firm operators and staff administrators. Built using Next.js (App Router), TypeScript, and Tailwind CSS (v4).

It uses components and styles from the `@fundos/ui` workspace package.

---

## 🎨 Key Features & Layouts
1. **Operations Navigation Sidebar**:
   - Navigation links for firm managers (Overview, Organizations, Challenge Presets, Trading Accounts, Payout Requests, KYC, Support, Settings).
   - Staff account footer status check.

2. **Payout Requests Audit Table**:
   - Real-time ledger tracking pending payouts with automatic system checks (KYC clearance status, rules compliance status) and action buttons to approve or reject payouts.

3. **KYC Verification Queue**:
   - Document review interface plotting passport, driver's licenses, or ID cards verification by country origin and submission timestamp.

4. **Multi-Tenant Active Firms List**:
   - Displays logical organization units mapped in PostgreSQL with active trader volume metrics.

5. **Operational Engines Health Status**:
   - Connection indicators reporting database connection states, caching health, MT5 bridge statuses, and webhooks logs.

---

## 🚀 Running Locally

Ensure that you have run `pnpm install` in the root monorepo directory first.

### Start Development Server
```bash
pnpm --filter admin-dashboard run dev
```
- Local Admin Portal URL: `http://localhost:3000` (or the next available port like `3002` if `3000` is taken by `trader-dashboard`).

### Build Production Bundle
```bash
pnpm --filter admin-dashboard run build
```
