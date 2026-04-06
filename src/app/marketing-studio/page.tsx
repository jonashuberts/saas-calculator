"use client";

import { useMemo } from "react";
import { SubscriptionInput, calculateAggregatedProjections, calculateTotalPastSavings } from "@/lib/calculator";
import { SavingsVisualizations } from "@/components/calculator/SavingsVisualizations";
import { QualitativeBenefits } from "@/components/calculator/QualitativeBenefits";
import { PiggyBank, Target, TrendingUp, Globe, AppWindow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function SubscriptionIcon({ name }: { name: string }) {
  const guessDomain = (appName: string) => {
    const lower = appName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')[0];
    const overrides: Record<string, string> = { vercel: "vercel.com", notion: "notion.so", netflix: "netflix.com" };
    return overrides[lower] || `${lower}.com`;
  };
  return (
    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
      <img src={`https://www.google.com/s2/favicons?domain=${guessDomain(name)}&sz=64`} alt="" className="w-5 h-5 object-contain rounded-sm" />
    </div>
  );
}

export default function MarketingStudio() {
  const currency = "EUR";
  const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const subscriptions: SubscriptionInput[] = [
    { id: "1", name: "Notion", saasPerUser: 10, users: 50, hasSelfHostedCost: true, selfHostedMonthly: 0, setupCost: 0, quitDate: new Date("2023-01-01") },
    { id: "2", name: "Netflix Premium", saasPerUser: 23, users: 1, hasSelfHostedCost: true, selfHostedMonthly: 10, setupCost: 2000, quitDate: null },
    { id: "3", name: "Vercel Pro", saasPerUser: 25, users: 40, hasSelfHostedCost: true, selfHostedMonthly: 25, setupCost: 0, quitDate: new Date("2023-06-01") },
    { id: "4", name: "Slack Pro", saasPerUser: 8.75, users: 50, hasSelfHostedCost: true, selfHostedMonthly: 40, setupCost: 300, quitDate: null }
  ];

  const projections = useMemo(() => calculateAggregatedProjections(subscriptions, 60), [subscriptions]);
  const pastSavings = useMemo(() => calculateTotalPastSavings(subscriptions), [subscriptions]);
  
  const year5 = projections[60] || { savings: 0 };
  const totalMonthlyGap = subscriptions.reduce((acc, sub) => acc + ((sub.saasPerUser * sub.users) - sub.selfHostedMonthly), 0);

  // Re-usable Wrapper Shell
  const BrowserShell = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full bg-[#0a0a0c] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden relative">
      <div className="p-10">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center gap-32 p-32 font-sans selection:bg-emerald-500/30">
      
      {/* SHOT 1: Hero Dashboard */}
      <div id="shot-1" className="w-[1400px] p-24 bg-gradient-to-br from-[#6366f1] via-[#c084fc] to-rose-200 flex items-center justify-center">
        <BrowserShell>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30"><PiggyBank className="w-8 h-8 text-emerald-400" /></div>
                <h1 className="text-4xl font-black text-white tracking-tighter">SaaS Tracker</h1>
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="border-white/10 bg-white/5 text-white"><Globe className="w-4 h-4 mr-2" /> EUR</Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <Card className="border-white/5 bg-white/[0.02] shadow-2xl rounded-2xl relative overflow-hidden"><CardContent className="p-5 flex justify-between"><div className="space-y-1"><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Monthly Savings</p><p className="text-3xl font-bold text-white">{formatCurrency(totalMonthlyGap)}</p></div><TrendingUp className="w-6 h-6 text-indigo-400" /></CardContent></Card>
               <Card className="border-emerald-500/20 bg-emerald-500/[0.03] shadow-2xl rounded-2xl relative overflow-hidden"><CardContent className="p-5 flex justify-between"><div className="space-y-1"><p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">5-Yr Projected Savings</p><p className="text-3xl font-black text-emerald-400">{formatCurrency(year5.savings)}</p></div><Target className="w-6 h-6 text-emerald-400" /></CardContent></Card>
               <Card className="border-white/5 bg-white/[0.02] shadow-2xl rounded-2xl relative overflow-hidden"><CardContent className="p-5 flex justify-between"><div className="space-y-1"><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Historical Savings</p><p className="text-3xl font-bold text-white">{formatCurrency(pastSavings)}</p></div><PiggyBank className="w-6 h-6 text-indigo-400" /></CardContent></Card>
            </div>

            <div className="rounded-3xl border border-white/10 shadow-2xl bg-black/40 overflow-hidden">
               <Table>
                 <TableHeader className="bg-white/5 border-b border-white/10"><TableRow><TableHead className="font-semibold h-14 text-white/70">Service / App</TableHead><TableHead className="text-right h-14 text-rose-400/80">SaaS Cost (mo)</TableHead><TableHead className="text-right h-14 text-emerald-400/80">Self-Hosted Cost (mo)</TableHead><TableHead className="text-right h-14 text-emerald-400">Monthly Savings</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {subscriptions.map(sub => {
                     const saasMonthly = sub.saasPerUser * sub.users;
                     return (
                       <TableRow key={sub.id} className="border-white/5">
                         <TableCell className="font-semibold text-white/90 py-4 max-w-[200px]"><div className="flex items-center gap-3"><SubscriptionIcon name={sub.name} />{sub.name}</div></TableCell>
                         <TableCell className="text-right text-rose-400/90 py-4">{formatCurrency(saasMonthly)}</TableCell>
                         <TableCell className="text-right text-emerald-400/90 py-4">{formatCurrency(sub.selfHostedMonthly)}</TableCell>
                         <TableCell className={`text-right py-4 flex flex-col items-end justify-center ${sub.quitDate ? 'text-emerald-400 font-bold' : 'text-amber-500/80 font-medium'}`}>
                           {formatCurrency(saasMonthly - sub.selfHostedMonthly)}
                           <span className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5">
                             {sub.quitDate ? 'Realized' : 'Potential'}
                           </span>
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

      {/* SHOT 2: Area Chart Tracker */}
      <div id="shot-2" className="w-[1400px] h-[850px] p-24 bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-200 flex flex-col items-center justify-center">
        <BrowserShell>
          <SavingsVisualizations projections={projections} subscriptions={subscriptions} currency={currency} hideBottomCharts />
        </BrowserShell>
      </div>

      {/* SHOT 3: Bottom Analytics */}
      <div id="shot-3" className="w-[1400px] h-[850px] p-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 flex flex-col items-center justify-center">
        <BrowserShell>
           <div className="space-y-6">
                 {/* This renders just the bar and pie chart grids without the command center */}
                 <SavingsVisualizations projections={projections} subscriptions={subscriptions} currency={currency} hideAreaChart hideCommandCenter />
           </div>
           <div className="hidden">
              <QualitativeBenefits />
           </div>
        </BrowserShell>
      </div>

    </div>
  );
}
