"use client";

import { ProjectionData, SubscriptionInput } from "@/lib/calculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, BarChart as BarChartIcon, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, PieChart, Pie, Sector, Label } from "recharts";

interface SavingsVisualizationsProps {
  projections: ProjectionData[];
  actualProjections?: ProjectionData[];
  subscriptions?: SubscriptionInput[];
  currency: 'USD' | 'EUR';
  hideAreaChart?: boolean;
  hideBottomCharts?: boolean;
  hideCommandCenter?: boolean;
}

const COLORS = ['#10b981', '#6366f1', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];

export function SavingsVisualizations({ projections, actualProjections, subscriptions = [], currency, hideAreaChart, hideBottomCharts, hideCommandCenter }: SavingsVisualizationsProps) {
  
  const year1 = projections[12] || projections[projections.length - 1];
  const year3 = projections[36] || projections[projections.length - 1];
  const year5 = projections[60] || projections[projections.length - 1];

  const currencySymbol = currency === 'EUR' ? '€' : '$';
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
  
  const formatCompact = (val: number) => 
    new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: currency, notation: "compact", maximumFractionDigits: 1 }).format(val);

  // --- Insight: Break Even Month ---
  const breakEvenProj = projections.find(p => p.savings > 0 && p.month > 0);
  const totalSetupCost = projections[0]?.selfHostedCumulative || 0;

  // --- Insight: Yearly Cash Flow ---
  const yearlyFlow = [1, 2, 3, 4, 5].map(year => {
    const monthIdx = year * 12;
    const prevMonthIdx = (year - 1) * 12;
    if (!projections[monthIdx]) return null;
    
    // For Year 1, the total net flow is exactly the accumulated savings at M12 (which naturally includes the M0 setup costs). 
    // For subsequent years, it's the delta between the current year and the previous year.
    const netFlow = year === 1 
      ? projections[monthIdx].savings 
      : projections[monthIdx].savings - (projections[prevMonthIdx]?.savings || 0);
      
    return {
      name: `Year ${year}`,
      netFlow,
    };
  }).filter(Boolean) as {name: string, netFlow: number}[];

  // --- Insight: Spend Distribution (Donut) ---
  const spendData = subscriptions.filter(sub => !sub.quitDate).map(sub => ({
    name: sub.name,
    value: sub.saasPerUser * sub.users,
  })).filter(s => s.value > 0);

  const totalMonthlySpend = spendData.reduce((a, b) => a + b.value, 0);

  // --- Insight: Active SaaS burn (not yet migrated) ---
  const activeSubs = subscriptions.filter(sub => !sub.quitDate);
  const migratedSubs = subscriptions.filter(sub => !!sub.quitDate);
  const activeMonthlyBurn = activeSubs.reduce((acc, sub) => acc + sub.saasPerUser * sub.users, 0);
  const potentialMonthlySavings = activeSubs.reduce((acc, sub) => {
    const selfHosted = sub.hasSelfHostedCost !== false ? sub.selfHostedMonthly : 0;
    return acc + (sub.saasPerUser * sub.users) - selfHosted;
  }, 0);

  // Actual projections rows (real costs: SaaS for active, self-hosted for migrated)
  const actYear1 = actualProjections?.[12] ?? year1;
  const actYear3 = actualProjections?.[36] ?? year3;
  const actYear5 = actualProjections?.[60] ?? year5;



  return (
    <div className="space-y-6">
      
      {/* Visual Insights Command Center */}
      {!hideCommandCenter && (totalSetupCost > 0 || activeMonthlyBurn > 0 || migratedSubs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active SaaS burn */}
          {activeMonthlyBurn > 0 && (
            <Card className="border-rose-500/20 bg-rose-500/[0.03] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 to-transparent" />
              <CardContent className="p-5">
                <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest mb-1">Active SaaS Spend</p>
                <p className="text-2xl font-black text-white">{formatCurrency(activeMonthlyBurn)}<span className="text-sm font-normal text-white/40">/mo</span></p>
                <p className="text-xs text-white/50 mt-1">{activeSubs.length} tool{activeSubs.length !== 1 ? 's' : ''} not yet migrated</p>
              </CardContent>
            </Card>
          )}
          {/* Potential extra monthly savings */}
          {potentialMonthlySavings > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/[0.03] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
              <CardContent className="p-5">
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-1">Potential Extra Savings</p>
                <p className="text-2xl font-black text-white">{formatCurrency(potentialMonthlySavings)}<span className="text-sm font-normal text-white/40">/mo</span></p>
                <p className="text-xs text-white/50 mt-1">If remaining {activeSubs.length} tool{activeSubs.length !== 1 ? 's' : ''} migrated too</p>
              </CardContent>
            </Card>
          )}
          {/* Break even */}
          {totalSetupCost > 0 && (
            <Card className="border-emerald-500/20 bg-emerald-500/[0.02] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
              <CardContent className="p-5">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest mb-1">Break-Even</p>
                {breakEvenProj ? (
                  <p className="text-2xl font-black text-white">Month <span className="text-emerald-400">{breakEvenProj.month}</span></p>
                ) : (
                  <p className="text-2xl font-black text-white/60">&gt; 5 Years</p>
                )}
                <p className="text-xs text-white/50 mt-1">Setup cost to recover: {formatCurrency(totalSetupCost)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Cumulative Chart */}
      {!hideAreaChart && (
      <Card className="border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3 text-white">
            <LineChart className="w-6 h-6 text-indigo-400" />
            5-Year Cumulative Trajectory
          </CardTitle>
          <CardDescription className="text-white/60 text-base">Projects your lifetime spend assuming all tools remained SaaS vs. your current self-hosted infrastructure.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="chart" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-black/40 border border-white/5 p-1 text-muted-foreground w-full max-w-[300px]">
                <TabsTrigger value="chart" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm w-full">Area Chart</TabsTrigger>
                <TabsTrigger value="table" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm w-full">Data Table</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chart" className="w-full mt-4" style={{ minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height={450}>
                <AreaChart
                  data={projections}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSaas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSelfHosted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.includes('Year') || value === 'Start' ? value : ''}
                    stroke="rgba(255,255,255,0.4)"
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCompact(value)}
                    stroke="rgba(255,255,255,0.4)"
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontWeight: 600 }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="saasCumulative" 
                    name="Total SaaS Cost"
                    stroke="#f43f5e" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSaas)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="selfHostedCumulative" 
                    name="Total Self-Hosted Cost"
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSelfHosted)" 
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="table">
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                       <TableHead className="text-white/70 h-12">Timeframe</TableHead>
                       <TableHead className="text-right text-rose-400 font-semibold h-12">
                         SaaS (If nothing migrated)
                       </TableHead>
                       <TableHead className="text-right text-amber-400 font-semibold h-12">
                         Actual Cost
                         <span className="block text-[10px] font-normal opacity-60">active SaaS + self-hosted</span>
                       </TableHead>
                       <TableHead className="text-right text-emerald-400 font-bold h-12 pr-6">Savings vs Full SaaS</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     <TableRow className="border-white/10 hover:bg-white/5 transition-colors">
                       <TableCell className="font-medium text-white/90 py-4">1 Year</TableCell>
                       <TableCell className="text-right py-4 text-rose-400/80">{formatCurrency(actYear1.saasCumulative)}</TableCell>
                       <TableCell className="text-right py-4 text-amber-400/90 font-medium">{formatCurrency(actYear1.selfHostedCumulative)}</TableCell>
                       <TableCell className={`text-right font-bold py-4 pr-6 ${actYear1.savings >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                         {formatCurrency(actYear1.savings)}
                       </TableCell>
                     </TableRow>
                     <TableRow className="border-white/10 hover:bg-white/5 transition-colors">
                       <TableCell className="font-medium text-white/90 py-4">3 Years</TableCell>
                       <TableCell className="text-right py-4 text-rose-400/80">{formatCurrency(actYear3.saasCumulative)}</TableCell>
                       <TableCell className="text-right py-4 text-amber-400/90 font-medium">{formatCurrency(actYear3.selfHostedCumulative)}</TableCell>
                       <TableCell className={`text-right font-bold py-4 pr-6 ${actYear3.savings >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                         {formatCurrency(actYear3.savings)}
                       </TableCell>
                     </TableRow>
                     <TableRow className="border-t-2 border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                       <TableCell className="font-bold text-white py-5">5 Years</TableCell>
                       <TableCell className="text-right text-rose-400 font-bold py-5">{formatCurrency(actYear5.saasCumulative)}</TableCell>
                       <TableCell className="text-right text-amber-400 font-bold py-5">{formatCurrency(actYear5.selfHostedCumulative)}</TableCell>
                       <TableCell className={`text-right font-black text-xl py-5 pr-6 ${actYear5.savings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                         {formatCurrency(actYear5.savings)}
                       </TableCell>
                     </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      )}

      {/* Deep Insights Rows */}
      {!hideBottomCharts && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Yearly Cash Flow Bar Chart */}
        <Card className="border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <BarChartIcon className="w-5 h-5 text-indigo-400" />
              Yearly Net Cash Flow
            </CardTitle>
            <CardDescription className="text-white/60">Annual savings specifically generated each year.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyFlow} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} tickFormatter={(value) => formatCompact(value)} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), "Net Savings"]}
                />
                <Bar dataKey="netFlow" name="Net Savings" fill="#10b981" radius={[6, 6, 6, 6]}>
                  {yearlyFlow.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.netFlow >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend Distribution Donut Chart */}
        <Card className="border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              SaaS Burn Distribution
            </CardTitle>
            <CardDescription className="text-white/60">Where your monthly SaaS money is going right now.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center justify-center relative">
             {spendData.length > 0 ? (
                <div className="w-full relative h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {spendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label 
                          value="SPEND" 
                          position="center" 
                          dy={-14} 
                          fill="rgba(255,255,255,0.5)"
                          fontSize={12}
                          fontWeight={600}
                        />
                        <Label 
                          value={formatCurrency(totalMonthlySpend)} 
                          position="center" 
                          dy={12} 
                          fill="#ffffff"
                          fontSize={24}
                          fontWeight={900}
                        />
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                         formatter={(value: any) => formatCurrency(Number(value))}
                         itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             ) : (
                <div className="h-[340px] flex items-center justify-center text-muted-foreground text-sm">
                   Add subscriptions to see distribution.
                </div>
             )}
          </CardContent>
        </Card>

      </div>
      )}
    </div>
  );
}
