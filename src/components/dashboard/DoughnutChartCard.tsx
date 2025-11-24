import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DoughnutChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export default function DoughnutChartCard({ title, data, colors }: DoughnutChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card text-foreground p-6 shadow-lg rounded-2xl">
        <p className="text-base font-light mb-4">{title}</p>
        <div className="h-72 flex items-center justify-center">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </div>
      </Card>
    );
  }

  // Custom label to show value with % sign
  const renderLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-lg">
          <p className="text-foreground font-medium">{payload[0].name}</p>
          <p className="text-primary font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card text-foreground p-6 shadow-lg rounded-2xl">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
