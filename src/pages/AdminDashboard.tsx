import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, TrendingUp, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import { dummyClientDetails, generateFakeMetrics } from "@/utils/mockData";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState("client1");
  const [period, setPeriod] = useState("month");
  const [showClientCard, setShowClientCard] = useState(false);

  const client = dummyClientDetails[selectedClient];
  const metrics = generateFakeMetrics(period);
  const latestMetric = metrics[metrics.length - 1];

  const handleSaveData = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Данные сохранены");
  };

  if (showClientCard) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 text-primary hover:text-primary/80"
            onClick={() => setShowClientCard(false)}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Вернуться к дашборду
          </Button>

          <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-8">
            <h2 className="text-3xl font-light mb-8 pb-4 border-b border-[hsl(var(--chart-border))]">
              Карточка клиента
            </h2>

            <div className="space-y-6">
              <Card className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] p-4 flex items-start space-x-4">
                <Users className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Закрепленный менеджер</p>
                  <p className="text-xl font-light">{client.manager}</p>
                </div>
              </Card>

              <Card className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] p-4 flex items-start space-x-4">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Название компании</p>
                  <p className="text-xl font-light">{client.name}</p>
                </div>
              </Card>

              <Card className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <MessageSquare className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Контактный телефон</p>
                    <p className="text-xl font-light">{client.phone}</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${client.phone.replace(/[^0-9+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition transform hover:scale-105"
                >
                  <MessageSquare className="w-6 h-6" />
                </a>
              </Card>

              <h3 className="text-2xl font-light mt-10 pt-5 border-t border-[hsl(var(--chart-border))]">
                Доступ в личный кабинет
              </h3>

              <Card className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <p className="text-sm text-muted-foreground">Логин (Email):</p>
                  <p className="text-lg font-mono">{client.login}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <p className="text-sm text-muted-foreground">Пароль:</p>
                  <p className="text-lg font-mono">{client.password}</p>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light">Панель администратора</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6 lg:col-span-1">
            <h3 className="text-xl font-light mb-4 pb-3 border-b border-[hsl(var(--chart-border))]">
              Выбор клиента
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground mb-2 block">Компания</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(dummyClientDetails).map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Статус ИИ</Label>
                <Select defaultValue="active">
                  <SelectTrigger className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Подключен</SelectItem>
                    <SelectItem value="paused">Приостановлен</SelectItem>
                    <SelectItem value="inactive">Отключен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[hsl(var(--chart-border))]">
              <h2
                className="text-3xl font-light text-[hsl(var(--chart-text))] mb-4 md:mb-0 hover:text-primary transition cursor-pointer"
                onClick={() => setShowClientCard(true)}
              >
                {client.name}
              </h2>

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

        <Card className="bg-[hsl(var(--chart-bg))] text-[hsl(var(--chart-text))] p-6">
          <h3 className="text-xl font-light mb-4 pb-3 border-b border-[hsl(var(--chart-border))]">
            Внесение данных клиента за период
          </h3>
          <form onSubmit={handleSaveData}>
            <Textarea
              className="bg-[hsl(var(--chart-bg))] border-[hsl(var(--chart-border))] text-white mb-4"
              rows={8}
              placeholder="Вставьте сюда данные клиента..."
            />
            <Button type="submit" className="w-full" variant="secondary">
              Сохранить изменения
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
