"use client";

import { CostInput } from "@/lib/calculator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Server, DollarSign, Calendar, Zap, Database } from "lucide-react";
import { useState } from "react";

interface CostInputSectionProps {
  inputs: CostInput;
  onChange: (inputs: CostInput) => void;
}

export function CostInputSection({ inputs, onChange }: CostInputSectionProps) {
  const [includeSetup, setIncludeSetup] = useState(inputs.setupCost > 0);
  const [isRetrospective, setIsRetrospective] = useState(!!inputs.quitDate);

  const handleChange = (field: keyof CostInput, value: any) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-rose-500" />
          The Costs
        </CardTitle>
        <CardDescription>Input your current SaaS spend and estimated self-hosting costs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* SaaS Inputs */}
        <div className="space-y-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
          <h3 className="font-semibold text-rose-500 flex items-center gap-2">
             SaaS Environment
          </h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="saasPerUser" className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" /> Price per User / Month
              </Label>
              <Input
                id="saasPerUser"
                type="number"
                min="0"
                value={inputs.saasPerUser}
                onChange={(e) => handleChange("saasPerUser", Number(e.target.value))}
                className="bg-background/50 border-rose-500/20 focus-visible:ring-rose-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="users" className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" /> Number of Users
              </Label>
              <Input
                id="users"
                type="number"
                min="1"
                value={inputs.users}
                onChange={(e) => handleChange("users", Number(e.target.value))}
                className="bg-background/50 border-rose-500/20 focus-visible:ring-rose-500"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center text-sm font-medium">
            <span className="text-muted-foreground">Monthly SaaS Cost:</span>
            <span className="text-rose-500 text-lg">${(inputs.saasPerUser * inputs.users).toLocaleString()}</span>
          </div>
        </div>

        {/* Self Hosted Inputs */}
        <div className="space-y-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <h3 className="font-semibold text-emerald-50 flex items-center gap-2">
             <Server className="w-4 h-4 text-emerald-500" /> Self-Hosted Infrastructure
          </h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="selfHostedMonthly" className="flex items-center gap-2 text-muted-foreground">
                <Database className="w-4 h-4" /> VPS / Cloud Cost / Month
              </Label>
              <Input
                id="selfHostedMonthly"
                type="number"
                min="0"
                value={inputs.selfHostedMonthly}
                onChange={(e) => handleChange("selfHostedMonthly", Number(e.target.value))}
                className="bg-background/50 border-emerald-500/20 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="setup-toggle" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="w-4 h-4 text-amber-500" /> Include Migration Cost
                </Label>
                <Switch 
                  id="setup-toggle" 
                  checked={includeSetup} 
                  onCheckedChange={(checked) => {
                    setIncludeSetup(checked);
                    if (!checked) handleChange("setupCost", 0);
                  }} 
                />
              </div>
              
              {includeSetup && (
                <div className="pl-6 animate-in slide-in-from-top-2 fade-in duration-200">
                  <Label htmlFor="setupCost" className="sr-only">Setup Cost</Label>
                  <Input
                    id="setupCost"
                    type="number"
                    min="0"
                    placeholder="E.g. $500 one-time"
                    value={inputs.setupCost}
                    onChange={(e) => handleChange("setupCost", Number(e.target.value))}
                    className="bg-background/50 border-amber-500/20 focus-visible:ring-amber-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">One-time cost for setup/migration.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Retrospective */}
        <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
           <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="retro-toggle" className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                  <Calendar className="w-4 h-4 text-indigo-400" /> I already quit!
                </Label>
                <p className="text-xs text-muted-foreground">Calculate money saved to date.</p>
              </div>
              <Switch 
                id="retro-toggle" 
                checked={isRetrospective} 
                onCheckedChange={(checked) => {
                  setIsRetrospective(checked);
                  if (!checked) handleChange("quitDate", null);
                  else handleChange("quitDate", new Date()); // Default to today, user can change
                }} 
              />
            </div>

            {isRetrospective && (
               <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                 <Label htmlFor="quitDate" className="text-muted-foreground text-sm mb-2 block">When did you switch?</Label>
                 <Input
                    id="quitDate"
                    type="month"
                    value={inputs.quitDate ? new Date(inputs.quitDate).toISOString().slice(0, 7) : ""}
                    onChange={(e) => handleChange("quitDate", e.target.value ? new Date(e.target.value) : null)}
                    className="bg-background/50 border-indigo-500/20 focus-visible:ring-indigo-500"
                  />
               </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}
