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

export default function DashboardPage() {
  // Mock data matching our database seed (trader 1: David Trader)
  const stats = {
    balance: "$10,391.00",
    equity: "$10,391.00",
    profit: "+$391.00",
    profitPercent: "+3.91%",
    dailyDrawdown: "$0.00",
    dailyDrawdownMax: "$500.00",
    dailyDrawdownPercent: "0.0%",
    maxDrawdown: "$0.00",
    maxDrawdownPercent: "0.0%",
    startingBalance: "$10,000.00",
  };

  const challengeInfo = {
    name: "$10,000 Starter Evaluation",
    phase: "Phase 1 / 2",
    profitTarget: "$1,000.00 (10%)",
    daysRemaining: "26 days",
    minTradingDays: "5 days",
    currentTradingDays: "2 days",
  };

  const recentTrades = [
    {
      id: "TRD_982735",
      symbol: "GBPUSD",
      type: "SELL",
      volume: "0.50",
      profit: "+$150.00",
      isProfit: true,
      time: "2026-08-03 02:26",
    },
    {
      id: "TRD_982734",
      symbol: "EURUSD",
      type: "BUY",
      volume: "1.00",
      profit: "+$250.00",
      isProfit: true,
      time: "2026-08-03 01:14",
    },
    {
      id: "TRD_982731",
      symbol: "EURUSD",
      type: "SELL",
      volume: "0.50",
      profit: "-$9.00",
      isProfit: false,
      time: "2026-08-02 18:34",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header & Active Account selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white">
            Welcome Back, David 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Here is your trading performance overview for account{" "}
            <span className="text-primary font-semibold">MT5 #1029482</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-card border border-border rounded-lg text-sm px-3 py-2 text-white outline-none focus:border-primary">
            <option>1029482 ($10,000 Starter)</option>
            <option>1029599 ($100,000 Master - Demo)</option>
          </select>
          <Button size="sm">Credentials</Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel" glow>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Account Balance
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-white mt-1">
              {stats.balance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>▲</span> {stats.profit} ({stats.profitPercent}) since start
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Current Equity
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-white mt-1">
              {stats.equity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Starting: {stats.startingBalance}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Daily Loss / Limit
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-red-400 mt-1">
              {stats.dailyDrawdown}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Max Loss: {stats.dailyDrawdownMax} ({stats.dailyDrawdownPercent})
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase">
              Max Drawdown / Limit
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold font-heading text-red-400 mt-1">
              {stats.maxDrawdown}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Max Limit: $1,000.00 ({stats.maxDrawdownPercent})
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart and Right Column (Challenge progress / Risk Score) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance curve Chart */}
        <Card className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-white text-lg">
                Equity Curve Progression
              </h3>
              <p className="text-xs text-muted-foreground">
                Visualizing account balance growth over the challenge duration
              </p>
            </div>
            <Badge variant="success">Safe Mode</Badge>
          </div>
          {/* Custom SVG Line Chart for premium look and reliability */}
          <div className="h-64 w-full relative mt-4">
            <svg
              className="w-full h-full"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#1E293B" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#1E293B" strokeWidth="1" strokeDasharray="4" />
              
              {/* Gradient Shading */}
              <path
                d="M 0 150 L 150 150 L 300 112 L 450 75 L 600 75 L 600 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Draw Line */}
              <path
                d="M 0 150 L 150 150 L 300 112 L 450 75 L 600 75"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              />
              
              {/* Dots */}
              <circle cx="150" cy="150" r="5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
              <circle cx="300" cy="112" r="5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
              <circle cx="450" cy="75" r="5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
              <circle cx="600" cy="75" r="5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">Start ($10,000)</div>
            <div className="absolute top-2 right-2 text-[10px] text-emerald-400 font-semibold">Target ($11,000)</div>
          </div>
        </Card>

        {/* Right Info: Challenge Progress */}
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-md font-bold">Challenge Progress</CardTitle>
              <CardDescription className="text-xs">{challengeInfo.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Profit Target (10%)</span>
                  <span className="text-white font-semibold">{stats.profit} / $1,000.00</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "39.1%" }}></div>
                </div>
              </div>

              {/* Status List */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-800/40 rounded-lg border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">Duration</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{challengeInfo.daysRemaining}</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-lg border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">Min Trading Days</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{challengeInfo.currentTradingDays} / {challengeInfo.minTradingDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-md font-bold">Behavioral Risk Score</CardTitle>
              <CardDescription className="text-xs">Dynamic analysis of consistency</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {/* Radial Score Gauge */}
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-heading font-extrabold text-white text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                82
              </div>
              <div className="flex-1">
                <Badge variant="success" className="mb-1">Consistent Style</Badge>
                <p className="text-xs text-muted-foreground">
                  Your lot sizing and trade hold durations show optimal discipline. Risk is well managed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rules & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Checklist */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white text-md font-bold">Evaluation Rules</CardTitle>
            <CardDescription className="text-xs">Must respect limits to pass</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white">Daily Loss limit: 5%</span>
              <Badge variant="success">Passed</Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white">Max Loss limit: 10%</span>
              <Badge variant="success">Passed</Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white">Minimum trading days: 5</span>
              <Badge variant="warning">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-white">No Weekend holding</span>
              <Badge variant="success">No Violation</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades Table */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-md font-bold">Recent Executions</CardTitle>
            <CardDescription className="text-xs">Live synced from MetaTrader 5</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                  <th className="py-2 pb-3">Ticket ID</th>
                  <th className="py-2 pb-3">Symbol</th>
                  <th className="py-2 pb-3">Type</th>
                  <th className="py-2 pb-3">Volume</th>
                  <th className="py-2 pb-3">Profit</th>
                  <th className="py-2 pb-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="text-xs hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-300">{trade.id}</td>
                    <td className="py-3 font-semibold text-white">{trade.symbol}</td>
                    <td className="py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          trade.type === "BUY"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{trade.volume}</td>
                    <td
                      className={`py-3 font-bold ${
                        trade.isProfit ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {trade.profit}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{trade.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
