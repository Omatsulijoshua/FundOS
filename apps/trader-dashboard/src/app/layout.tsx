import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FundOS | Trader Dashboard",
  description: "Proprietary Trading Firm Operating System - Trader Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-background text-foreground font-sans flex overflow-hidden">
        {/* Sidebar Container */}
        <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            {/* Logo */}
            <div className="h-16 px-6 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-lg shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                F
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Fund<span className="text-primary">OS</span>
              </span>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1">
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20"
              >
                📊 Dashboard
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                🏆 Challenges
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                💻 Trading Accounts
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                📈 Performance
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                💼 Wallet
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                🔔 Notifications
              </a>
            </nav>
          </div>

          {/* User profile / Logout at bottom */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-border flex items-center justify-center text-xs font-semibold text-white">
                DT
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">David Trader</span>
                <span className="text-[10px] text-muted-foreground">ID: 1029482</span>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all text-xs">
              Logout
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header Bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="font-heading font-bold text-lg text-white md:block hidden">
                Dashboard Overview
              </h1>
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
                  F
                </div>
                <span className="font-heading font-extrabold text-md text-white">
                  FundOS
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Broker Feed Connected
              </div>
              <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                🔔
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
