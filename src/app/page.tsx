"use client";

import { useState, useMemo, useEffect } from "react";
import { CostInput, SubscriptionInput, calculateAggregatedProjections, calculateTotalPastSavings } from "@/lib/calculator";
import { SaasTemplateCards } from "@/components/calculator/SaasTemplateCards";
import { CostInputSection } from "@/components/calculator/CostInputSection";
import { SavingsVisualizations } from "@/components/calculator/SavingsVisualizations";
import { QualitativeBenefits } from "@/components/calculator/QualitativeBenefits";
import { PiggyBank, Target, RefreshCw, Plus, Edit2, TrendingUp, X, AppWindow, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_INPUTS: Omit<SubscriptionInput, 'id' | 'name'> = {
  saasPerUser: 10,
  users: 1,
  hasSelfHostedCost: false,
  selfHostedMonthly: 0,
  setupCost: 0,
  quitDate: null,
};

function SubscriptionIcon({ name }: { name: string }) {
  const [error, setError] = useState(false);
  
  const guessDomain = (appName: string) => {
    const lower = appName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')[0];
    const overrides: Record<string, string> = {
      notion: "notion.so",
      github: "github.com",
      linear: "linear.app",
      slack: "slack.com",
      vercel: "vercel.com",
      spotify: "spotify.com",
      netflix: "netflix.com",
      jira: "atlassian.com",
      confluence: "atlassian.com",
      figma: "figma.com",
    };
    return overrides[lower] || `${lower}.com`;
  };

  if (error || !name) {
    return (
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <AppWindow className="w-4 h-4 text-white/40" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
      <img 
        src={`https://www.google.com/s2/favicons?domain=${guessDomain(name)}&sz=64`}
        alt={`${name} icon`}
        className="w-5 h-5 object-contain rounded-sm"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function CalculatorDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('EUR');
  const [subscriptions, setSubscriptions] = useState<SubscriptionInput[]>([{
    id: "sub-1",
    name: "Primary Application",
    ...DEFAULT_INPUTS
  }]);

  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedSubs = localStorage.getItem("saas_tracker_subs");
      if (savedSubs) setSubscriptions(JSON.parse(savedSubs));
      const savedCurrency = localStorage.getItem("saas_tracker_currency");
      if (savedCurrency === 'USD' || savedCurrency === 'EUR') setCurrency(savedCurrency);
    } catch (e) {
      console.warn("Failed to load local storage", e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("saas_tracker_subs", JSON.stringify(subscriptions));
      localStorage.setItem("saas_tracker_currency", currency);
    }
  }, [subscriptions, currency, isMounted]);

  const toggleCurrency = () => setCurrency(prev => prev === 'USD' ? 'EUR' : 'USD');

  const projections = useMemo(() => calculateAggregatedProjections(subscriptions, 60), [subscriptions]);
  const pastSavings = useMemo(() => calculateTotalPastSavings(subscriptions), [subscriptions]);
  
  const year5 = projections[60] || projections[projections.length - 1] || { savings: 0 };
  const totalMonthlyGap = subscriptions.reduce((acc, sub) => {
    const selfHosted = sub.hasSelfHostedCost !== false ? sub.selfHostedMonthly : 0;
    return acc + ((sub.saasPerUser * sub.users) - selfHosted);
  }, 0);
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);

  const handleReset = () => {
    setSubscriptions([{ id: "sub-1", name: "Primary Application", ...DEFAULT_INPUTS }]);
    setActiveSubId(null);
  };

  const handleAddSubscription = () => {
    const newId = `sub-${Math.random().toString(36).substring(7)}`;
    setSubscriptions(prev => [ ...prev, { id: newId, name: `New Subscription`, ...DEFAULT_INPUTS } ]);
    setActiveSubId(newId);
  };

  const handleUpdateSubscription = (updated: SubscriptionInput) => {
    setSubscriptions(prev => prev.map(sub => sub.id === updated.id ? updated : sub));
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    if (activeSubId === id) setActiveSubId(null);
  };

  const handleAddTemplate = (name: string, partial: Partial<CostInput>) => {
    const newId = `sub-${Math.random().toString(36).substring(7)}`;
    setSubscriptions(prev => [ ...prev, { id: newId, name, ...DEFAULT_INPUTS, ...partial } ]);
    setActiveSubId(newId);
  };

  const activeSubscription = subscriptions.find(s => s.id === activeSubId);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-foreground selection:bg-emerald-500/30 font-sans">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0c]">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),rgba(255,255,255,0))]"></div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <PiggyBank className="w-8 h-8 text-emerald-400" />
              </div>
              SaaS Tracker
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl font-medium leading-relaxed">
              Track multi-app migrations and calculate absolute ROI when moving to Self-Hosted tools.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleCurrency} className="shrink-0 gap-2 border-white/10 rounded-xl px-4 h-10 w-24 bg-white/5 hover:bg-white/10 text-white font-semibold">
              <Globe className="w-4 h-4" /> {currency}
            </Button>
            <Button variant="outline" onClick={handleReset} className="shrink-0 gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 border-white/10 rounded-xl px-4 h-10 bg-black/50 text-white hover:border-destructive/50">
              <RefreshCw className="w-4 h-4" /> Reset 
            </Button>
          </div>
        </div>

        {/* Global Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl rounded-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
             <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Monthly Savings</p>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {formatCurrency(totalMonthlyGap)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
             </CardContent>
          </Card>
          
          <Card className="border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-3xl shadow-2xl shadow-emerald-500/5 rounded-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-500/20"></div>
             <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">5-Yr Projected Savings</p>
                  <p className="text-3xl font-black text-emerald-400 tracking-tight drop-shadow-sm">
                    {formatCurrency(year5.savings)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
             </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl rounded-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
             <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Historical Savings (To Date)</p>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {formatCurrency(pastSavings)}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Across all migrated tools</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <PiggyBank className="w-6 h-6 text-indigo-400" />
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Quick Add Examples Section */}
        <div className="space-y-3 pt-2 pb-4 border-b border-white/5">
          <div className="flex items-baseline gap-3">
             <h2 className="text-lg font-semibold tracking-tight text-white/90">Quick Add:</h2>
             <p className="text-muted-foreground text-xs">Instantly add a common pattern.</p>
          </div>
          <SaasTemplateCards onSelectTemplate={handleAddTemplate} />
        </div>

        {/* Tracker Overview Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="space-y-1">
               <h2 className="text-2xl font-bold tracking-tight text-white">Active Core Apps</h2>
             </div>
             <Button 
                onClick={handleAddSubscription} 
                className="shrink-0 rounded-xl h-10 px-5 bg-white text-black hover:bg-zinc-200 transition-all font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
             >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom App
             </Button>
          </div>

          <div className="rounded-3xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px] h-14 text-white/70 font-semibold">Service / App</TableHead>
                  <TableHead className="text-right h-14 text-rose-400/80 font-semibold">SaaS Cost (mo)</TableHead>
                  <TableHead className="text-right h-14 text-emerald-400/80 font-semibold">Self-Hosted Cost (mo)</TableHead>
                  <TableHead className="text-right h-14 text-emerald-400 font-bold">Monthly Savings</TableHead>
                  <TableHead className="text-right h-14 text-white/70 w-[100px] pr-6">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map(sub => {
                  const saasMonthly = sub.saasPerUser * sub.users;
                  const selfHostedMonthly = sub.hasSelfHostedCost !== false ? sub.selfHostedMonthly : 0;
                  const gap = saasMonthly - selfHostedMonthly;
                  return (
                    <TableRow key={sub.id} className="hover:bg-white/[0.03] transition-colors border-white/5 group">
                      <TableCell className="font-semibold text-white/90 py-4">
                        <div className="flex items-center gap-3">
                          <SubscriptionIcon name={sub.name} />
                          {sub.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-rose-400/90 py-4 font-medium">{formatCurrency(saasMonthly)}</TableCell>
                      <TableCell className="text-right text-emerald-400/90 py-4 font-medium">
                        {sub.hasSelfHostedCost !== false ? formatCurrency(selfHostedMonthly) : <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">Shared (Free)</span>}
                      </TableCell>
                      <TableCell className="text-right text-emerald-400 font-bold py-4">{formatCurrency(gap)}</TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setActiveSubId(sub.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {subscriptions.length === 0 && (
              <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-full">
                  <Plus className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-muted-foreground text-lg max-w-sm">No subscriptions tracked yet. Add a custom app or choose a preset above to begin tracking.</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor Modal Overlay */}
        <AnimatePresence>
          {activeSubscription && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pt-10 px-4 pb-4 sm:p-0">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setActiveSubId(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
              />
              
              {/* Modal Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-50 w-full max-w-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                  <h3 className="font-semibold text-xl text-white">Edit Subscription</h3>
                  <Button variant="ghost" size="icon" onClick={() => setActiveSubId(null)} className="rounded-full hover:bg-white/10 text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-8 overflow-y-auto custom-scrollbar">
                  <CostInputSection
                    subscription={activeSubscription}
                    onChange={handleUpdateSubscription}
                    onDelete={() => handleDeleteSubscription(activeSubscription.id)}
                    currency={currency}
                  />
                </div>
                
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                  <Button 
                    onClick={() => setActiveSubId(null)}
                    className="rounded-xl px-8 bg-white text-black hover:bg-zinc-200 transition-all font-semibold shadow-lg"
                  >
                    Done Editing
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Projections */}
        <div className="pt-4">
          <SavingsVisualizations projections={projections} subscriptions={subscriptions} currency={currency} />
        </div>

        {/* Benefits Section */}
        <div className="pt-16 mt-8 border-t border-white/10">
          <QualitativeBenefits />
        </div>
      </main>
    </div>
  );
}
