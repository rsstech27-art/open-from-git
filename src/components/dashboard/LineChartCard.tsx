import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export default function LineChartCard({ title, data, color }: LineChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card text-foreground p-6 border shadow-lg rounded-2xl">
        <p className="text-base font-light mb-4">{title}</p>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-foreground p-6 border shadow-lg rounded-2xl">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color, r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
