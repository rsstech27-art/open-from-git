import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, DollarSign, Users, LogOut } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import { parsePhoneNumber } from 'libphonenumber-js';
import { useAuth } from "@/contexts/AuthContext";
import { useClientByUserId } from "@/hooks/useClients";
import { useMetrics } from "@/hooks/useMetrics";

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [period, setPeriod] = useState("2025-10");
  
  const { data: client, isLoading: clientLoading } = useClientByUserId(user?.id);
  const { data: metrics = [], isLoading: metricsLoading } = useMetrics(client?.id, period);
  
  const latestMetric = metrics[metrics.length - 1] || {
    conversion: 0,
    autonomy: 0,
    financial_equiv: 0,
    retention_share: 0,
  };

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
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/50 w-fit">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-light text-green-300">Подключен</span>
              </div>

              {(() => {
                try {
                  const managerPhone = '+79808851903';
                  const phoneNumber = parsePhoneNumber(managerPhone, 'RU');
                  if (phoneNumber.isValid()) {
                    const cleanNumber = phoneNumber.number.replace(/\+/g, '');
                    const message = encodeURIComponent(`Здравствуйте! Пишу вам по поводу ИИ-ассистента для ${client.company_name}.`);
                    
                    const handleWhatsAppClick = () => {
                      window.open(`https://web.whatsapp.com/send?phone=${cleanNumber}&text=${message}`, '_blank');
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

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 bg-muted border text-foreground rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-10">Октябрь 2025</SelectItem>
                <SelectItem value="2025-09">Сентябрь 2025</SelectItem>
                <SelectItem value="2025-08">Август 2025</SelectItem>
                <SelectItem value="2025-07">Июль 2025</SelectItem>
                <SelectItem value="2025-06">Июнь 2025</SelectItem>
                <SelectItem value="2025-05">Май 2025</SelectItem>
                <SelectItem value="2025-04">Апрель 2025</SelectItem>
                <SelectItem value="2025-03">Март 2025</SelectItem>
                <SelectItem value="2025-02">Февраль 2025</SelectItem>
                <SelectItem value="2025-01">Январь 2025</SelectItem>
                <SelectItem value="2024-12">Декабрь 2024</SelectItem>
                <SelectItem value="2024-11">Ноябрь 2024</SelectItem>
                <SelectItem value="2024-10">Октябрь 2024</SelectItem>
                <SelectItem value="2024-09">Сентябрь 2024</SelectItem>
                <SelectItem value="2024-08">Август 2024</SelectItem>
                <SelectItem value="2024-07">Июль 2024</SelectItem>
                <SelectItem value="2024-06">Июнь 2024</SelectItem>
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
              data={metrics.map((m) => ({ 
                name: new Date(m.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), 
                value: Number((m.conversion * 100).toFixed(1)) 
              }))}
              color="hsl(189 94% 43%)"
            />
            <LineChartCard
              title="Автономность (без админа)"
              data={metrics.map((m) => ({ 
                name: new Date(m.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), 
                value: Number((m.autonomy * 100).toFixed(1)) 
              }))}
              color="hsl(280 70% 60%)"
            />
            <BarChartCard
              title="Финансовый эквивалент экономии"
              data={metrics.map((m) => ({ 
                name: new Date(m.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), 
                value: m.financial_equiv 
              }))}
              color="hsl(189 94% 43%)"
            />
            <DoughnutChartCard
              title="Новые / Повторные клиенты"
              data={[
                { name: "Повторные", value: Number((latestMetric.retention_share * 100).toFixed(1)) },
                { name: "Новые", value: Number(((1 - latestMetric.retention_share) * 100).toFixed(1)) },
              ]}
              colors={["hsl(280 70% 60%)", "hsl(189 94% 43%)"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
