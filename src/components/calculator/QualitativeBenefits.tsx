import { Shield, Lock, Settings, Cloud } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const BENEFITS = [
  {
    title: "Data Sovereignty & Privacy",
    description: "Your data stays on your own servers. No third-party tracking, no AI scraping your proprietary information.",
    icon: Lock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Infinite Customization",
    description: "Modify the source code to fit your exact workflow. You're never waiting on a SaaS company's roadmap again.",
    icon: Settings,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "No Vendor Lock-in",
    description: "Export, migrate, or backup your database whenever you want. You own the infrastructure and the architecture.",
    icon: Shield,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Always Available",
    description: "When AWS us-east-1 goes down, your local or specialized VPS deployments can keep your team online and working.",
    icon: Cloud,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  }
];

export function QualitativeBenefits() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight">Beyond Cost Savings</h2>
        <p className="text-muted-foreground">
          While the financial ROI is massive, the qualitative benefits of self-hosting often outweigh the monetary gains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFITS.map((benefit, i) => (
          <Card key={i} className="bg-card/30 border-border/40 hover:bg-card/60 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${benefit.bg}`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <CardTitle className="text-lg">{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
