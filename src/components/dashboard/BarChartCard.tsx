import { Card } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  color: string;
}

export default function BarChartCard({ title, labels, data, color }: BarChartCardProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: color,
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
        ticks: {
          color: "#E0E0E0",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#E0E0E0",
        },
      },
    },
  };

  return (
    <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6 border-0 shadow-lg">
      <p className="text-base font-light mb-4">{title}</p>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
