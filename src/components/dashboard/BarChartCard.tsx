import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export default function BarChartCard({ title, data, color }: BarChartCardProps) {
  return (
    <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6 border-0 shadow-lg">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#E0E0E0" />
            <YAxis stroke="#E0E0E0" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--chart-bg))",
                border: "1px solid hsl(var(--chart-border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
