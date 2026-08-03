"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@fundos/ui";

export default function AdminDashboardPage() {
  // Mock administrative metrics matching DB states
  const stats = {
    totalFirms: "14",
    totalTraders: "1,492",
    activeChallenges: "842",
    totalRevenue: "$148,200.00",
    revenueGrowth: "+12.4% this month",
  };

  const payoutRequests = [
    {
      id: "PAY_201948",
      trader: "David Trader",
      firm: "Apex Funding",
      amount: "$1,250.00",
      kycStatus: "VERIFIED",
      ruleCheck: "PASSED",
      date: "2026-08-03 01:10",
    },
    {
      id: "PAY_201945",
      trader: "Sarah Profit",
      firm: "Master Traders",
      amount: "$4,800.00",
      kycStatus: "VERIFIED",
      ruleCheck: "PASSED",
      date: "2026-08-02 21:14",
    },
    {
      id: "PAY_201941",
      trader: "Michael Risk",
      firm: "Apex Funding",
      amount: "$850.00",
      kycStatus: "PENDING",
      ruleCheck: "PASSED",
      date: "2026-08-02 16:34",
    },
  ];

  const recentFirms = [
    { id: "ORG_001", name: "Apex Funding Group", slug: "apex", status: "ACTIVE", traders: "824" },
    { id: "ORG_002", name: "Alpha Prop Traders", slug: "alpha", status: "ACTIVE", traders: "412" },
    { id: "ORG_003", name: "Titan Capital Partners", slug: "titan", status: "ACTIVE", traders: "256" },
  ];

  const kycQueue = [
    { name: "John Carter", document: "Passport", country: "US", time: "5 mins ago" },
    { name: "Yuki Tanaka", document: "ID Card", country: "JP", time: "18 mins ago" },
    { name: "Emma Weber", document: "Driver License", country: "DE", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white">
            System Operations Overview
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time multi-tenant stats across all active proprietary trading organizations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Export CSV</Button>
          <Button size="sm">System Logs</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel" glow>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Total Prop Firms
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-white mt-1">
              {stats.totalFirms}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-indigo-400 font-semibold">
              2 newly provisioned this week
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Registered Traders
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-white mt-1">
              {stats.totalTraders}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>▲</span> +148 new registrations
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Active Challenges
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-white mt-1">
              {stats.activeChallenges}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              74 accounts currently in evaluation
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Platform Net Revenue
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-white mt-1">
              {stats.totalRevenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-emerald-400 font-semibold">
              {stats.revenueGrowth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Payout requests & Right queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Approval Grid */}
        <Card className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-white text-lg">
                Payout Approvals Queue
              </h3>
              <p className="text-xs text-muted-foreground">
                Review pending payouts with automatically validated trading rules compliance.
              </p>
            </div>
            <Badge variant="warning">Manual Review Needed</Badge>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                  <th className="py-2 pb-3">Ticket ID</th>
                  <th className="py-2 pb-3">Trader</th>
                  <th className="py-2 pb-3">Amount</th>
                  <th className="py-2 pb-3">KYC Check</th>
                  <th className="py-2 pb-3">Rules Verification</th>
                  <th className="py-2 pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payoutRequests.map((req) => (
                  <tr key={req.id} className="text-xs hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-300">{req.id}</td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{req.trader}</span>
                        <span className="text-[10px] text-muted-foreground">{req.firm}</span>
                      </div>
                    </td>
                    <td className="py-3 font-bold text-white">{req.amount}</td>
                    <td className="py-3">
                      <Badge variant={req.kycStatus === "VERIFIED" ? "success" : "warning"}>
                        {req.kycStatus}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="success">
                        {req.ruleCheck}
                      </Badge>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <Button size="xs" variant="success">Approve</Button>
                      <Button size="xs" variant="destructive">Decline</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* KYC Verification Panel */}
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-md font-bold">KYC Validation Queue</CardTitle>
            <CardDescription className="text-xs">Incoming documents awaiting audit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kycQueue.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-border">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">{item.document} ({item.country})</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] text-muted-foreground">{item.time}</span>
                  <Button size="xs">Audit</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Firms and Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Organizations */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-md font-bold">Active Prop Firms (Tenants)</CardTitle>
            <CardDescription className="text-xs">Logical database partitions active in FundOS</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                  <th className="py-2 pb-3">Firm ID</th>
                  <th className="py-2 pb-3">Name</th>
                  <th className="py-2 pb-3">Slug</th>
                  <th className="py-2 pb-3">Status</th>
                  <th className="py-2 pb-3 text-right">Active Traders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentFirms.map((firm) => (
                  <tr key={firm.id} className="text-xs hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-300">{firm.id}</td>
                    <td className="py-3 font-semibold text-white">{firm.name}</td>
                    <td className="py-3 font-semibold text-indigo-400">/{firm.slug}</td>
                    <td className="py-3">
                      <Badge variant="success">{firm.status}</Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-300">{firm.traders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white text-md font-bold">System Health status</CardTitle>
            <CardDescription className="text-xs">Real-time gateway connectivity status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white font-semibold">PostgreSQL Engine Node</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white font-semibold">Redis Cache Node</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white font-semibold">MetaTrader 5 Bridge Feed</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white font-semibold">Stripe Payment Webhook</span>
              <span className="text-emerald-400 font-bold">HEALTHY</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
