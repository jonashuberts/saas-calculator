"use client";

import { CostInput } from "@/lib/calculator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Template {
  name: string;
  description: string;
  data: Partial<CostInput>;
  color: string;
}

const TEMPLATES: Template[] = [
  {
    name: "Notion",
    description: "$10/user",
    data: { saasPerUser: 10, selfHostedMonthly: 15, setupCost: 0 },
    color: "hover:border-zinc-400 hover:text-zinc-100",
  },
  {
    name: "GitHub Team",
    description: "$4/user",
    data: { saasPerUser: 4, selfHostedMonthly: 20, setupCost: 100 },
    color: "hover:border-indigo-400 hover:text-indigo-400",
  },
  {
    name: "Linear",
    description: "$8/user",
    data: { saasPerUser: 8, selfHostedMonthly: 12, setupCost: 0 },
    color: "hover:border-purple-400 hover:text-purple-400",
  },
  {
    name: "Slack Pro",
    description: "$8.75/user",
    data: { saasPerUser: 8.75, selfHostedMonthly: 40, setupCost: 300 },
    color: "hover:border-amber-400 hover:text-amber-400",
  },
  {
    name: "Vercel Pro",
    description: "$20/user + bandwidth",
    data: { saasPerUser: 20, selfHostedMonthly: 25, setupCost: 0 },
    color: "hover:border-blue-400 hover:text-blue-400",
  },
  {
    name: "Spotify Duo/Family",
    description: "$15-20/month",
    data: { saasPerUser: 17, users: 1, selfHostedMonthly: 5, setupCost: 150 }, // Self-host: Navidrome on a Pi
    color: "hover:border-emerald-400 hover:text-emerald-400",
  },
  {
    name: "Netflix Premium",
    description: "$23/month",
    data: { saasPerUser: 23, users: 1, selfHostedMonthly: 10, setupCost: 300 }, // Self-host: Jellyfin + Storage
    color: "hover:border-rose-400 hover:text-rose-400",
  }
];

interface SaasTemplateCardsProps {
  onSelectTemplate: (name: string, data: Partial<CostInput>) => void;
}

export function SaasTemplateCards({ onSelectTemplate }: SaasTemplateCardsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATES.map((template, i) => (
        <motion.div
          key={template.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Button
            variant="outline"
            onClick={() => onSelectTemplate(template.name, template.data)}
            className={`h-auto py-2 px-3 flex items-center gap-2 bg-white/5 backdrop-blur-sm border-white/10 transition-all duration-300 ${template.color} rounded-full`}
          >
            <span className="font-semibold text-sm">{template.name}</span>
            <span className="text-[10px] text-muted-foreground opacity-70 hidden sm:inline-block">• {template.description}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
