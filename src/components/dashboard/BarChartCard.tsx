import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export default function BarChartCard({ title, data, color }: BarChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card text-foreground p-6 shadow-lg rounded-2xl">
        <p className="text-base font-light mb-4">{title}</p>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-foreground p-6 shadow-lg rounded-2xl">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
