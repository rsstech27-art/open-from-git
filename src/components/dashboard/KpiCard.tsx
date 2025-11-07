import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: "purple" | "cyan" | "salmon" | "green";
}

const gradients = {
  purple: "bg-gradient-to-br from-[hsl(var(--gradient-purple-start))] to-[hsl(var(--gradient-purple-end))]",
  cyan: "bg-gradient-to-br from-[hsl(var(--gradient-cyan-start))] to-[hsl(var(--gradient-cyan-end))]",
  salmon: "bg-gradient-to-br from-[hsl(var(--gradient-salmon-start))] to-[hsl(var(--gradient-salmon-end))]",
  green: "bg-gradient-to-br from-[hsl(var(--gradient-green-start))] to-[hsl(var(--gradient-green-end))]",
};

export default function KpiCard({ title, value, icon: Icon, gradient }: KpiCardProps) {
  return (
    <Card className={`${gradients[gradient]} text-white p-6 relative overflow-hidden border-0 shadow-lg`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-radial-gradient" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-light opacity-90">{title}</p>
          <Icon className="w-6 h-6 opacity-80" />
        </div>
        <p className="text-3xl font-light">{value}</p>
      </div>
    </Card>
  );
}
