import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface DoughnutChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export default function DoughnutChartCard({ title, data, colors }: DoughnutChartCardProps) {
  return (
    <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6 border-0 shadow-lg">
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
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Legend
              wrapperStyle={{ color: "#E0E0E0" }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
