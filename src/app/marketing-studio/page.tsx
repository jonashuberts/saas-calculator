"use client";

import { useMemo } from "react";
import { SubscriptionInput, calculateAggregatedProjections, calculateActualCostProjections, calculateTotalPastSavings, calculateHistoricalSpend } from "@/lib/calculator";
import { SavingsVisualizations } from "@/components/calculator/SavingsVisualizations";
import { PiggyBank, Globe, AppWindow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function SubscriptionIcon({ name }: { name: string }) {
  const guessDomain = (appName: string) => {
    const lower = appName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')[0];
    const overrides: Record<string, string> = { vercel: "vercel.com", notion: "notion.so", netflix: "netflix.com", slack: "slack.com" };
    return overrides[lower] || `${lower}.com`;
  };
  return (
    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
      <img src={`https://www.google.com/s2/favicons?domain=${guessDomain(name)}&sz=64`} alt="" className="w-5 h-5 object-contain rounded-sm" />
    </div>
  );
}

export default function MarketingStudio() {
  const currency = "EUR" as const;
  const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const subscriptions: SubscriptionInput[] = [
    { id: "1", name: "Notion", saasPerUser: 10, users: 50, hasSelfHostedCost: true, selfHostedMonthly: 0, setupCost: 0, startDate: new Date("2021-03-01"), quitDate: new Date("2023-01-01") },
    { id: "2", name: "Netflix Premium", saasPerUser: 23, users: 1, hasSelfHostedCost: true, selfHostedMonthly: 10, setupCost: 2000, startDate: new Date("2020-06-01"), quitDate: null },
    { id: "3", name: "Vercel Pro", saasPerUser: 25, users: 40, hasSelfHostedCost: true, selfHostedMonthly: 25, setupCost: 0, startDate: new Date("2022-01-01"), quitDate: new Date("2023-06-01") },
    { id: "4", name: "Slack Pro", saasPerUser: 8.75, users: 50, hasSelfHostedCost: true, selfHostedMonthly: 40, setupCost: 300, startDate: new Date("2021-09-01"), quitDate: null }
  ];

  const projections = useMemo(() => calculateAggregatedProjections(subscriptions, 60), [subscriptions]);
  const actualProjections = useMemo(() => calculateActualCostProjections(subscriptions, 60), [subscriptions]);
  const pastSavings = useMemo(() => calculateTotalPastSavings(subscriptions), [subscriptions]);
  
  const year5 = projections[60] || { savings: 0 };
  const activeSubs = subscriptions.filter(s => !s.quitDate);
  const migratedSubs = subscriptions.filter(s => !!s.quitDate);
  const activeMonthlyBurn = activeSubs.reduce((acc, s) => acc + s.saasPerUser * s.users, 0);

  const BrowserShell = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full bg-[#0a0a0c] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden relative">
      <div className="p-10">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center gap-32 p-32 font-sans selection:bg-emerald-500/30">
      
      {/* SHOT 1: Hero Dashboard — matches real app layout exactly */}
      <div id="shot-1" className="w-[1400px] p-24 bg-gradient-to-br from-[#6366f1] via-[#c084fc] to-rose-200 flex items-center justify-center">
        <BrowserShell>
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30"><PiggyBank className="w-8 h-8 text-emerald-400" /></div>
                <h1 className="text-4xl font-black text-white tracking-tighter">SaaS Tracker</h1>
              </div>
              <Button variant="outline" className="border-white/10 bg-white/5 text-white"><Globe className="w-4 h-4 mr-2" /> EUR</Button>
            </div>

            {/* 3 KPI cards — same as real app */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-rose-500/20 bg-rose-500/[0.03] rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 to-transparent" />
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">Current SaaS Bill</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(activeMonthlyBurn)}<span className="text-sm font-normal text-white/40">/mo</span></p>
                  <p className="text-xs text-white/40 mt-1">{activeSubs.length} active · {migratedSubs.length} migrated</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent" />
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Saved Since Migrations</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(pastSavings)}</p>
                  <p className="text-xs text-white/40 mt-1">Across {migratedSubs.length} retired SaaS tool{migratedSubs.length !== 1 ? 's' : ''}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/20 bg-emerald-500/[0.03] rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">5-Yr Projected Savings</p>
                  <p className="text-3xl font-black text-emerald-400">{formatCurrency(year5.savings)}</p>
                  <p className="text-xs text-white/40 mt-1">If all tools fully migrated</p>
                </CardContent>
              </Card>
            </div>

            {/* Table — same columns as real app */}
            <div className="rounded-3xl border border-white/10 shadow-2xl bg-black/40 overflow-hidden">
               <Table>
                 <TableHeader className="bg-white/5 border-b border-white/10"><TableRow><TableHead className="font-semibold h-14 text-white/70">Service / App</TableHead><TableHead className="text-right h-14 text-rose-400/80">SaaS Cost (mo)</TableHead><TableHead className="text-right h-14 text-emerald-400/80">Self-Hosted Cost (mo)</TableHead><TableHead className="text-right h-14 text-emerald-400 font-bold">Monthly Gap</TableHead><TableHead className="text-right h-14 text-rose-300 font-semibold">Total Spent (to date)</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {subscriptions.map(sub => {
                     const saasMonthly = sub.saasPerUser * sub.users;
                     const selfHostedMonthly = sub.hasSelfHostedCost !== false ? sub.selfHostedMonthly : 0;
                     const gap = saasMonthly - selfHostedMonthly;
                     return (
                       <TableRow key={sub.id} className={`border-white/5 ${sub.quitDate ? 'opacity-70' : ''}`}>
                         <TableCell className="font-semibold text-white/90 py-4 max-w-[200px]">
                           <div className="flex items-center gap-3">
                             <div className={sub.quitDate ? 'grayscale opacity-70' : ''}><SubscriptionIcon name={sub.name} /></div>
                             <div className="flex items-center gap-2">
                               {sub.name}
                               {sub.quitDate && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Migrated</span>}
                             </div>
                           </div>
                         </TableCell>
                         <TableCell className="text-right py-4 font-medium">
                           <span className={sub.quitDate ? "line-through text-rose-400/40" : "text-rose-400/90"}>{formatCurrency(saasMonthly)}</span>
                         </TableCell>
                         <TableCell className="text-right text-emerald-400/90 py-4 font-medium">
                           {sub.hasSelfHostedCost !== false ? formatCurrency(selfHostedMonthly) : <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">Shared (Free)</span>}
                         </TableCell>
                         <TableCell className={`text-right py-4 ${sub.quitDate ? 'text-emerald-400 font-bold' : 'text-amber-500/80 font-medium'}`}>
                           {formatCurrency(gap)}
                           <span className="block text-[9px] uppercase tracking-wider opacity-60 mt-0.5">{sub.quitDate ? 'Realized' : 'Potential'}</span>
                         </TableCell>
                         <TableCell className="text-right py-4 text-white/60 font-medium">
                           {formatCurrency(calculateHistoricalSpend(sub))}
                         </TableCell>
                       </TableRow>
                     )
                   })}
                 </TableBody>
               </Table>
            </div>
          </div>
        </BrowserShell>
      </div>

      {/* SHOT 2: Area Chart only */}
      <div id="shot-2" className="w-[1400px] p-24 bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-200 flex flex-col items-center justify-center">
        <BrowserShell>
          <SavingsVisualizations projections={projections} actualProjections={actualProjections} subscriptions={subscriptions} currency={currency} hideBottomCharts hideCommandCenter />
        </BrowserShell>
      </div>

      {/* SHOT 3: Bar + Donut only */}
      <div id="shot-3" className="w-[1400px] p-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 flex flex-col items-center justify-center">
        <BrowserShell>
          <SavingsVisualizations projections={projections} actualProjections={actualProjections} subscriptions={subscriptions} currency={currency} hideAreaChart hideCommandCenter />
        </BrowserShell>
      </div>

    </div>
  );
}
