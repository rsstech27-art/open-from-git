import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export default function LineChartCard({ title, data, color }: LineChartCardProps) {
  return (
    <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6 border-0 shadow-lg">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
