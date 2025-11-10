import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartCardProps {
  title: string;
  value: number; // 0 to 1 (0% to 100%)
  icon: React.ReactNode;
}

export default function GaugeChartCard({ title, value, icon }: GaugeChartCardProps) {
  // Convert value to percentage (0-100)
  const percentage = Math.min(Math.max(value * 100, 0), 100);
  
  // Create data for the gauge (semicircle)
  const gaugeData = [
    { name: 'value', value: percentage },
    { name: 'empty', value: 100 - percentage }
  ];

  // Color based on satisfaction level
  const getColor = (percent: number) => {
    if (percent >= 76) return 'hsl(142 71% 45%)'; // Green (76-100%)
    if (percent >= 51) return 'hsl(45 93% 47%)'; // Yellow (51-75%)
    if (percent >= 26) return 'hsl(25 95% 53%)'; // Orange (26-50%)
    return 'hsl(0 72% 51%)'; // Red (0-25%)
  };

  const color = getColor(percentage);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-base font-light">{title}</p>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
            <div className="text-4xl font-bold">{percentage.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {percentage >= 80 ? 'Отлично' : 
               percentage >= 60 ? 'Хорошо' : 
               percentage >= 40 ? 'Удовлетворительно' : 'Низкая'}
            </div>
          </div>
        </div>
        {/* Scale markers */}
        <div className="flex justify-between px-4 text-xs text-muted-foreground -mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
}
