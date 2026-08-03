import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FundOS | Admin Portal",
  description: "Proprietary Trading Firm Operating System - Admin Portal",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost';
  const slug = host.split('.')[0] || 'default';

  let branding = {
    primaryColor: '#4f46e5', // Default Indigo for Admin
    accentColor: '#30b0c7',
    companyName: 'FundOS',
  };

  try {
    const res = await fetch(`http://localhost:3001/api/v1/tenant/branding`, {
      headers: {
        'x-tenant-slug': slug,
      },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        branding.primaryColor = data.primaryColor || branding.primaryColor;
        branding.accentColor = data.accentColor || branding.accentColor;
        branding.companyName = data.companyName || branding.companyName;
      }
    }
  } catch (e) {
    // Fallback if API not running
  }

  return (
    <html lang="en" className="h-full antialiased dark" style={{
      ['--primary-color' as any]: branding.primaryColor,
      ['--accent-color' as any]: branding.accentColor,
    }}>
      <body className="min-h-full bg-background text-foreground font-sans flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            {/* Logo */}
            <div className="h-16 px-6 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                F
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Fund<span className="text-indigo-400">OS</span> <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-sans tracking-normal ml-0.5">Admin</span>
              </span>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1">
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
              >
                📊 Overview
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                🏢 Organizations
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                🏆 Challenge Presets
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
                💳 Payout Requests
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                🆔 KYC Verifications
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                🎫 Support Tickets
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                ⚙️ Stripe & Settings
              </a>
            </nav>
          </div>

          {/* User profile / Logout at bottom */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-900 border border-border flex items-center justify-center text-xs font-semibold text-white">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Alex Director</span>
                <span className="text-[10px] text-muted-foreground">Admin Portal</span>
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
                Operations Control Centre
              </h1>
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  F
                </div>
                <span className="font-heading font-extrabold text-md text-white">
                  FundOS
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                FundOS Engine Online
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
