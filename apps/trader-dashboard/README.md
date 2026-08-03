# 📊 FundOS Trader Dashboard

The Next.js client application for proprietary trading firm traders. Built using Next.js (App Router), TypeScript, and Tailwind CSS (v4).

It uses components and styles from the `@fundos/ui` workspace package.

---

## 🎨 Key Features & Layouts
1. **Side Navigation Sidebar**:
   - Seamless navigation options for traders (Dashboard, Challenges, Accounts, Performance, Wallets, Notifications).
   - Trader ID and profile footer mapping with quick logout control.

2. **Performance Equity Curve**:
   - Custom SVG line chart plotting account balance progression over the challenge duration, keeping loading footprint minimal.

3. **Active Rules Guard Grid**:
   - Live checks showing validation metrics (Daily Loss Limits, Max Loss limits, Minimum Trading Days, Weekend holding policies).

4. **Consistency / Behavior Risk Score**:
   - Visual gauge plotting lot sizing and trading hold consistency to protect the capital of the prop firm organization.

5. **Live Executions Ledger**:
   - Live trades log matching tickets, volume, buy/sell flags, execution time, and net profits/losses.

---

## 🚀 Running Locally

Ensure that you have run `pnpm install` in the root monorepo directory first.

### Start Development Server
```bash
pnpm --filter trader-dashboard run dev
```
- Local dashboard URL: `http://localhost:3000`

### Build Production Bundle
```bash
pnpm --filter trader-dashboard run build
```
