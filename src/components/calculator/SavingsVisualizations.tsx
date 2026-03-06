"use client";

import { CostInput, ProjectionData } from "@/lib/calculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, LineChart, Target, PiggyBank } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

interface SavingsVisualizationsProps {
  projections: ProjectionData[];
  inputs: CostInput;
  pastSavings: number;
}

export function SavingsVisualizations({ projections, inputs, pastSavings }: SavingsVisualizationsProps) {
  
  const year1 = projections[12] || projections[projections.length - 1];
  const year3 = projections[36] || projections[projections.length - 1];
  const year5 = projections[60] || projections[projections.length - 1];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Retrospective Savings highlight */}
      {inputs.quitDate && pastSavings > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/5"
        >
           <div className="flex items-center gap-4">
             <div className="p-3 bg-emerald-500/20 rounded-full">
               <PiggyBank className="w-8 h-8 text-emerald-500" />
             </div>
             <div>
               <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Money Saved So Far!</p>
               <p className="text-3xl font-black text-emerald-500 tracking-tight">
                 {formatCurrency(pastSavings)}
               </p>
               <p className="text-xs text-muted-foreground mt-1">Since {new Date(inputs.quitDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}</p>
             </div>
           </div>
        </motion.div>
      )}

      {/* Main Charts area */}
      <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="w-6 h-6 text-indigo-500" />
            5-Year Projection
          </CardTitle>
          <CardDescription>Cumulative cost comparison over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 max-w-[400px]">
              <TabsTrigger value="chart">Area Chart</TabsTrigger>
              <TabsTrigger value="table">Data Table</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="w-full mt-4" style={{ minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={projections}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSaas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-saas)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--chart-saas)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSelfHosted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-self-hosted)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--chart-self-hosted)" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.includes('Year') || value === 'Start' ? value : ''}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ fontWeight: 600 }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area 
                    type="monotone" 
                    dataKey="saasCumulative" 
                    name="SaaS Cost"
                    stroke="var(--chart-saas)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSaas)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="selfHostedCumulative" 
                    name="Self-Hosted Cost"
                    stroke="var(--chart-self-hosted)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSelfHosted)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="table">
              <div className="rounded-md border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Timeframe</TableHead>
                      <TableHead className="text-right text-rose-500 font-semibold">Total SaaS</TableHead>
                      <TableHead className="text-right text-emerald-500 font-semibold">Total Self-Hosted</TableHead>
                      <TableHead className="text-right text-indigo-400 font-bold">Money Saved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">1 Year</TableCell>
                      <TableCell className="text-right">{formatCurrency(year1.saasCumulative)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(year1.selfHostedCumulative)}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-500">
                        {formatCurrency(year1.savings)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3 Years</TableCell>
                      <TableCell className="text-right">{formatCurrency(year3.saasCumulative)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(year3.selfHostedCumulative)}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-500">
                        {formatCurrency(year3.savings)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/20">
                      <TableCell className="font-bold">5 Years</TableCell>
                      <TableCell className="text-right text-rose-500 font-semibold">{formatCurrency(year5.saasCumulative)}</TableCell>
                      <TableCell className="text-right text-emerald-500 font-semibold">{formatCurrency(year5.selfHostedCumulative)}</TableCell>
                      <TableCell className="text-right font-black text-emerald-500 text-lg">
                        {formatCurrency(year5.savings)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Mini summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40 bg-card/50">
           <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Gap</p>
                <p className="text-xl font-bold">
                  {formatCurrency((inputs.saasPerUser * inputs.users) - inputs.selfHostedMonthly)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-400 opacity-50" />
           </CardContent>
        </Card>
        <Card className="border-border/40 bg-emerald-500/5 border-emerald-500/20">
           <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total 5-Yr Savings</p>
                <p className="text-2xl font-black text-emerald-500 tracking-tight">
                  {formatCurrency(year5.savings)}
                </p>
              </div>
              <Target className="w-10 h-10 text-emerald-500 opacity-20" />
           </CardContent>
        </Card>
      </div>

    </div>
  );
}
