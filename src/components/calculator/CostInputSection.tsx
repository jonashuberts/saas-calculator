"use client";

import { SubscriptionInput } from "@/lib/calculator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Server, DollarSign, Calendar, Zap, Database, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CostInputSectionProps {
  subscription: SubscriptionInput;
  onChange: (subscription: SubscriptionInput) => void;
  onDelete: () => void;
  currency: 'USD' | 'EUR';
}

export function CostInputSection({ subscription, onChange, onDelete, currency }: CostInputSectionProps) {
  const currencySymbol = currency === 'EUR' ? '€' : '$';
  const [includeSetup, setIncludeSetup] = useState(subscription.setupCost > 0);
  const [isRetrospective, setIsRetrospective] = useState(!!subscription.quitDate);

  const handleChange = (field: keyof SubscriptionInput, value: any) => {
    onChange({ ...subscription, [field]: value });
  };

  return (
    <div className="relative">
      <div className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <Input 
            className="text-xl font-bold bg-transparent border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none hover:bg-muted/50 rounded-md transition-colors w-full"
            value={subscription.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Subscription Name"
          />
          <Button variant="ghost" size="icon" onClick={onDelete} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        
        {/* SaaS Inputs */}
        <div className="space-y-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
          <h3 className="font-semibold text-rose-500 flex items-center gap-2 text-sm">
             SaaS Environment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`saasPerUser-${subscription.id}`} className="flex items-center gap-2 text-muted-foreground text-xs">
                <DollarSign className="w-3 h-3" /> Price / User (/mo)
              </Label>
              <Input
                id={`saasPerUser-${subscription.id}`}
                type="number"
                min="0"
                step="0.01"
                value={subscription.saasPerUser || ""}
                onChange={(e) => handleChange("saasPerUser", e.target.value === "" ? 0 : Number(e.target.value))}
                className="bg-background/50 border-rose-500/20 focus-visible:ring-rose-500 h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`users-${subscription.id}`} className="flex items-center gap-2 text-muted-foreground text-xs">
                <Users className="w-3 h-3" /> Users
              </Label>
              <Input
                id={`users-${subscription.id}`}
                type="number"
                min="1"
                value={subscription.users || ""}
                onChange={(e) => handleChange("users", e.target.value === "" ? 0 : Number(e.target.value))}
                className="bg-background/50 border-rose-500/20 focus-visible:ring-rose-500 h-9"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center text-sm font-medium">
            <span className="text-muted-foreground">Monthly SaaS Cost:</span>
            <span className="text-rose-500 text-base">{currencySymbol}{(subscription.saasPerUser * subscription.users).toLocaleString()}</span>
          </div>
        </div>

        {/* Self Hosted Inputs */}
        <div className="space-y-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-emerald-50 flex items-center gap-2 text-sm">
               <Server className="w-4 h-4 text-emerald-500" /> Self-Hosted Infra
            </h3>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={`infra-toggle-${subscription.id}`} className="text-muted-foreground text-xs cursor-pointer">
                Extra Cost?
              </Label>
              <Switch 
                id={`infra-toggle-${subscription.id}`} 
                checked={subscription.hasSelfHostedCost !== false} 
                onCheckedChange={(checked) => {
                  const updates: Partial<SubscriptionInput> = { hasSelfHostedCost: checked };
                  if (!checked) {
                    updates.selfHostedMonthly = 0;
                    updates.setupCost = 0;
                    setIncludeSetup(false);
                  }
                  onChange({ ...subscription, ...updates });
                }} 
              />
            </div>
          </div>
          
          {subscription.hasSelfHostedCost !== false ? (
            <div className="grid gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="space-y-2">
                <Label htmlFor={`selfHostedMonthly-${subscription.id}`} className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Database className="w-3 h-3" /> VPS / Cloud Cost / Month
                </Label>
                <Input
                  id={`selfHostedMonthly-${subscription.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={subscription.selfHostedMonthly || ""}
                  onChange={(e) => handleChange("selfHostedMonthly", e.target.value === "" ? 0 : Number(e.target.value))}
                  className="bg-background/50 border-emerald-500/20 focus-visible:ring-emerald-500 h-9"
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`setup-toggle-${subscription.id}`} className="flex items-center gap-2 cursor-pointer text-xs">
                    <Zap className="w-3 h-3 text-amber-500" /> Migration Cost
                  </Label>
                  <Switch 
                    id={`setup-toggle-${subscription.id}`} 
                    checked={includeSetup} 
                    onCheckedChange={(checked) => {
                      setIncludeSetup(checked);
                      if (!checked) handleChange("setupCost", 0);
                    }} 
                  />
                </div>
                
                {includeSetup && (
                  <div className="pl-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Input
                      id={`setupCost-${subscription.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={`E.g. ${currencySymbol}500 one-time`}
                      value={subscription.setupCost || ""}
                      onChange={(e) => handleChange("setupCost", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="bg-background/50 border-amber-500/20 focus-visible:ring-amber-500 h-9"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-black/20 p-3 rounded-lg flex items-center gap-2 animate-in fade-in duration-200 border border-white/5">
              🚀 Running on shared/existing infrastructure. Zero extra cost!
            </div>
          )}
        </div>

        {/* Retrospective */}
        <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
           <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={`retro-toggle-${subscription.id}`} className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Already quit!
                </Label>
              </div>
              <Switch 
                id={`retro-toggle-${subscription.id}`} 
                checked={isRetrospective} 
                onCheckedChange={(checked) => {
                  setIsRetrospective(checked);
                  if (!checked) handleChange("quitDate", null);
                  else handleChange("quitDate", new Date());
                }} 
              />
            </div>

            {isRetrospective && (
               <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                 <Label htmlFor={`quitDate-${subscription.id}`} className="text-muted-foreground text-xs mb-2 block">Switch Date</Label>
                 <Input
                    id={`quitDate-${subscription.id}`}
                    type="month"
                    value={subscription.quitDate ? new Date(subscription.quitDate).toISOString().slice(0, 7) : ""}
                    onChange={(e) => handleChange("quitDate", e.target.value ? new Date(e.target.value) : null)}
                    className="bg-background/50 border-indigo-500/20 focus-visible:ring-indigo-500 h-9"
                  />
               </div>
            )}
        </div>

      </div>
    </div>
  );
}
