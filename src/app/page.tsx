"use client";

import { useState, useMemo } from "react";
import { CostInput, calculateProjections, calculatePastSavings } from "@/lib/calculator";
import { SaasTemplateCards } from "@/components/calculator/SaasTemplateCards";
import { CostInputSection } from "@/components/calculator/CostInputSection";
import { SavingsVisualizations } from "@/components/calculator/SavingsVisualizations";
import { QualitativeBenefits } from "@/components/calculator/QualitativeBenefits";
import { PiggyBank, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_INPUTS: CostInput = {
  saasPerUser: 10,
  users: 50,
  selfHostedMonthly: 40,
  setupCost: 500,
  quitDate: null,
};

export default function CalculatorDashboard() {
  const [inputs, setInputs] = useState<CostInput>(DEFAULT_INPUTS);

  const projections = useMemo(() => calculateProjections(inputs, 60), [inputs]);
  const pastSavings = useMemo(() => calculatePastSavings(inputs), [inputs]);

  const handleReset = () => setInputs(DEFAULT_INPUTS);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
              <PiggyBank className="w-10 h-10 text-emerald-500" />
              SaaS to Self-Hosted
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Calculate your exact ROI when migrating from expensive SaaS per-user pricing to fixed-cost self-hosting.
            </p>
          </div>
          <Button variant="outline" onClick={handleReset} className="shrink-0 gap-2">
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Presets</h2>
          <SaasTemplateCards onSelectTemplate={(partial) => setInputs(prev => ({ ...prev, ...partial }))} />
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <CostInputSection inputs={inputs} onChange={(newInputs) => setInputs(newInputs)} />
          </div>
          <div className="lg:col-span-8 flex flex-col space-y-8">
            <SavingsVisualizations 
              projections={projections} 
              inputs={inputs} 
              pastSavings={pastSavings} 
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="pt-12 border-t border-border">
          <QualitativeBenefits />
        </div>
      </main>
    </div>
  );
}
