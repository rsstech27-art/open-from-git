import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import { dummyClientDetails, generateFakeMetrics } from "@/utils/mockData";

const MOCK_CLIENT_ID = "client1";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("month");

  const client = dummyClientDetails[MOCK_CLIENT_ID];
  const metrics = generateFakeMetrics(period);
  const latestMetric = metrics[metrics.length - 1];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light">Личный кабинет</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Выйти
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[hsl(var(--chart-border))]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-4 md:mb-0">
              <h2 className="text-3xl font-light text-[hsl(var(--chart-text))] mb-2 sm:mb-0">
                {client.name}
              </h2>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/50 w-fit">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-light text-green-300">Подключен</span>
              </div>

              <a
                href="https://wa.me/79990001122?text=Здравствуйте!%20Пишу%20вам%20по%20поводу%20ИИ-ассистента."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 mt-4 sm:mt-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition transform hover:scale-105 w-fit"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-light">Связаться с менеджером</span>
              </a>
            </div>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">За неделю</SelectItem>
                <SelectItem value="month">За месяц</SelectItem>
                <SelectItem value="half_year">За полгода</SelectItem>
                <SelectItem value="year">За год</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Конверсия в запись"
              value={`${(latestMetric.conversion * 100).toFixed(1)}%`}
              icon={MessageSquare}
              gradient="purple"
            />
            <KpiCard
              title="Автономность"
              value={`${(latestMetric.autonomy * 100).toFixed(1)}%`}
              icon={TrendingUp}
              gradient="cyan"
            />
            <KpiCard
              title="Экономия"
              value={`${latestMetric.financial_equiv.toLocaleString()} ₽`}
              icon={DollarSign}
              gradient="salmon"
            />
            <KpiCard
              title="Повторные клиенты"
              value={`${(latestMetric.retention_share * 100).toFixed(1)}%`}
              icon={Users}
              gradient="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChartCard
              title="Конверсия в запись"
              data={metrics.map((m) => ({ name: m.date, value: Number((m.conversion * 100).toFixed(1)) }))}
              color="rgba(0, 200, 200, 1)"
            />
            <LineChartCard
              title="Автономность (без админа)"
              data={metrics.map((m) => ({ name: m.date, value: Number((m.autonomy * 100).toFixed(1)) }))}
              color="rgba(138, 43, 226, 1)"
            />
            <BarChartCard
              title="Финансовый эквивалент экономии"
              data={metrics.map((m) => ({ name: m.date, value: m.financial_equiv }))}
              color="rgba(255, 95, 109, 1)"
            />
            <DoughnutChartCard
              title="Новые / Повторные клиенты"
              data={[
                { name: "Повторные", value: Number((latestMetric.retention_share * 100).toFixed(1)) },
                { name: "Новые", value: Number(((1 - latestMetric.retention_share) * 100).toFixed(1)) },
              ]}
              colors={["rgba(50, 205, 50, 1)", "rgba(255, 215, 0, 1)"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
