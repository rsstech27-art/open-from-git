import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, Users, LogOut, Clock, CheckCircle2, Smile } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import GaugeChartCard from "@/components/dashboard/GaugeChartCard";
import { parsePhoneNumber } from 'libphonenumber-js';
import { useAuth } from "@/contexts/AuthContext";
import { useClientByUserId } from "@/hooks/useClients";
import { useMetrics } from "@/hooks/useMetrics";

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [period, setPeriod] = useState("2025-10");
  const [viewMode, setViewMode] = useState<"month" | "half_year" | "year">("month");
  
  const { data: client, isLoading: clientLoading } = useClientByUserId(user?.id);
  const { data: metrics = [], isLoading: metricsLoading } = useMetrics(client?.id, viewMode === "month" ? period : viewMode);

  // Generate periods starting from October 2025
  const generatePeriods = () => {
    const periods = [];
    const startDate = new Date(2025, 9, 1); // October 2025
    const monthsToGenerate = 12; // Generate next 12 months

    for (let i = 0; i < monthsToGenerate; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      periods.push({
        value: `${year}-${month}`,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    }
    return periods;
  };

  const periods = generatePeriods();
  
  // Aggregate metrics based on view mode
  const aggregatedMetric = (() => {
    if (metrics.length === 0) {
      return null; // Return null instead of zeros when no data
    }

    if (viewMode === "month") {
      // For month view, find the metric for the selected period
      const monthMetric = metrics.find(m => m.period_type === period);
      return monthMetric || null;
    }

    // For half_year and year views, aggregate the data
    const sum = metrics.reduce((acc, m) => ({
      conversion: acc.conversion + m.conversion,
      autonomy: acc.autonomy + m.autonomy,
      time_saved_hours: acc.time_saved_hours + (m.time_saved_hours || 0),
      confirmed_appointments: acc.confirmed_appointments + (m.confirmed_appointments || 0),
      satisfaction: acc.satisfaction + m.satisfaction,
      business_hours_appointments: acc.business_hours_appointments + (m.business_hours_appointments || 0),
      non_business_hours_appointments: acc.non_business_hours_appointments + (m.non_business_hours_appointments || 0),
      short_dialogs: acc.short_dialogs + (m.short_dialogs || 0),
      medium_dialogs: acc.medium_dialogs + (m.medium_dialogs || 0),
      long_dialogs: acc.long_dialogs + (m.long_dialogs || 0),
    }), {
      conversion: 0,
      autonomy: 0,
      time_saved_hours: 0,
      confirmed_appointments: 0,
      satisfaction: 0,
      business_hours_appointments: 0,
      non_business_hours_appointments: 0,
      short_dialogs: 0,
      medium_dialogs: 0,
      long_dialogs: 0,
    });

    // Calculate averages for percentage metrics, sum for count metrics
    return {
      conversion: sum.conversion / metrics.length,
      autonomy: sum.autonomy / metrics.length,
      time_saved_hours: sum.time_saved_hours,
      confirmed_appointments: sum.confirmed_appointments,
      satisfaction: sum.satisfaction / metrics.length,
      business_hours_appointments: sum.business_hours_appointments,
      non_business_hours_appointments: sum.non_business_hours_appointments,
      short_dialogs: sum.short_dialogs,
      medium_dialogs: sum.medium_dialogs,
      long_dialogs: sum.long_dialogs,
    };
  })();

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <p className="text-foreground mb-4">Клиент не найден. Обратитесь к администратору.</p>
          <Button variant="outline" onClick={signOut} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light">Личный кабинет</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-4 md:mb-0">
              <h2 className="text-3xl font-light text-foreground mb-2 sm:mb-0">
                {client.company_name}
              </h2>

              {/* AI Status Badge */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border w-fit ${
                client.ai_status === 'active' 
                  ? 'bg-green-500/10 border-green-500/50' 
                  : client.ai_status === 'paused'
                  ? 'bg-yellow-500/10 border-yellow-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  client.ai_status === 'active' 
                    ? 'bg-green-400 animate-pulse' 
                    : client.ai_status === 'paused'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-light ${
                  client.ai_status === 'active' 
                    ? 'text-green-300' 
                    : client.ai_status === 'paused'
                    ? 'text-yellow-300'
                    : 'text-red-300'
                }`}>
                  {client.ai_status === 'active' ? 'Подключен' : client.ai_status === 'paused' ? 'Приостановлен' : 'Отключен'}
                </span>
              </div>

              {(() => {
                try {
                  const managerPhone = '+79808851903';
                  const phoneNumber = parsePhoneNumber(managerPhone, 'RU');
                  if (phoneNumber.isValid()) {
                    const cleanNumber = phoneNumber.number.replace(/\+/g, '');
                    const message = encodeURIComponent(`Здравствуйте! Пишу вам по поводу ИИ-ассистента для ${client.company_name}.`);
                    
                    const handleWhatsAppClick = () => {
                      // Try web.whatsapp.com instead of wa.me if blocked
                      const waUrl = `https://wa.me/${cleanNumber}?text=${message}`;
                      window.open(waUrl, '_blank');
                    };
                    
                    return (
                      <button
                        onClick={handleWhatsAppClick}
                        className="flex items-center space-x-2 mt-4 sm:mt-0 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition transform hover:scale-105 w-fit"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-light">Связаться с менеджером</span>
                      </button>
                    );
                  }
                } catch (error) {
                  console.error('Invalid phone number:', error);
                }
                return null;
              })()}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="rounded-none"
                >
                  Месяц
                </Button>
                <Button
                  variant={viewMode === "half_year" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("half_year")}
                  className="rounded-none border-l border-r border-border"
                >
                  Полгода
                </Button>
                <Button
                  variant={viewMode === "year" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("year")}
                  className="rounded-none"
                >
                  Год
                </Button>
              </div>

              {viewMode === "month" && (
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-48 bg-muted border text-foreground rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {aggregatedMetric ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Конверсия в запись"
                value={`${(aggregatedMetric.conversion * 100).toFixed(1)}%`}
                icon={MessageSquare}
                gradient="purple"
              />
              <KpiCard
                title="Автономность"
                value={`${(aggregatedMetric.autonomy * 100).toFixed(1)}%`}
                icon={TrendingUp}
                gradient="cyan"
              />
              <KpiCard
                title="Экономия времени"
                value={`${aggregatedMetric.time_saved_hours || 0} ч`}
                icon={Clock}
                gradient="salmon"
              />
              <KpiCard
                title="Подтвержденные записи"
                value={aggregatedMetric.confirmed_appointments || 0}
                icon={CheckCircle2}
                gradient="green"
              />
            </div>
          ) : (
            <Card className="bg-card text-foreground p-8 rounded-2xl shadow-lg text-center">
              <p className="text-muted-foreground">
                {viewMode === "month" 
                  ? "Данные за выбранный месяц еще не заполнены" 
                  : "Данные за выбранный период еще не заполнены"}
              </p>
            </Card>
          )}

          {aggregatedMetric && metrics.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {viewMode !== "month" && (
                <>
                  <LineChartCard
                    title="Конверсия в запись"
                    data={metrics.map((m) => {
                      const [year, month] = (m.period_type || '').split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1);
                      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' });
                      return {
                        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        value: Number((m.conversion * 100).toFixed(1))
                      };
                    })}
                    color="hsl(189 94% 43%)"
                  />
                  <LineChartCard
                    title="Автономность (без админа)"
                    data={metrics.map((m) => {
                      const [year, month] = (m.period_type || '').split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1);
                      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' });
                      return {
                        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        value: Number((m.autonomy * 100).toFixed(1))
                      };
                    })}
                    color="hsl(280 70% 60%)"
                  />
                  <BarChartCard
                    title="Экономия времени (часы)"
                    data={metrics.map((m) => {
                      const [year, month] = (m.period_type || '').split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1);
                      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' });
                      return {
                        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        value: m.time_saved_hours || 0
                      };
                    })}
                    color="hsl(189 94% 43%)"
                  />
                </>
              )}
              <GaugeChartCard
                title="Удовлетворенность клиента"
                value={aggregatedMetric.satisfaction}
                icon={<Smile className="h-4 w-4 text-muted-foreground" />}
              />
              <DoughnutChartCard
                title="Подтвержденные записи"
                data={[
                  { name: "Подтверждено", value: aggregatedMetric.confirmed_appointments || 0 },
                  { name: "Всего диалогов", value: (aggregatedMetric.short_dialogs || 0) + (aggregatedMetric.medium_dialogs || 0) + (aggregatedMetric.long_dialogs || 0) - (aggregatedMetric.confirmed_appointments || 0) },
                ]}
                colors={["hsl(160 80% 65%)", "hsl(280 85% 70%)"]}
              />
              <DoughnutChartCard
                title="Записи по времени"
                data={[
                  { name: "Рабочее время", value: aggregatedMetric.business_hours_appointments },
                  { name: "Нерабочее время", value: aggregatedMetric.non_business_hours_appointments },
                ]}
                colors={["hsl(189 94% 58%)", "hsl(330 90% 72%)"]}
              />
              <DoughnutChartCard
                title="Длительность диалогов"
                data={[
                  { name: "Короткие", value: aggregatedMetric.short_dialogs },
                  { name: "Средние", value: aggregatedMetric.medium_dialogs },
                  { name: "Длинные", value: aggregatedMetric.long_dialogs },
                ]}
                colors={["hsl(189 94% 58%)", "hsl(280 85% 70%)", "hsl(330 90% 72%)"]}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
