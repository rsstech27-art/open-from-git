import { Card } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  colors: string[];
}

export default function DoughnutChartCard({ title, labels, data, colors }: DoughnutChartCardProps) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#E0E0E0",
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6 border-0 shadow-lg">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-72 flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
      </div>
    </Card>
  );
}
