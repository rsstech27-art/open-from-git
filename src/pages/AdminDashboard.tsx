import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MessageSquare, TrendingUp, RussianRuble, Users, LogOut, Plus, CheckCircle2, AlertCircle, Smile, Clock } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import GaugeChartCard from "@/components/dashboard/GaugeChartCard";
import { toast } from "sonner";
import { z } from "zod";
import { parsePhoneNumber } from 'libphonenumber-js';
import { useAuth } from "@/contexts/AuthContext";
import { useClients, useClient, useUpdateClient, useCreateClient } from "@/hooks/useClients";
import { useManagers } from "@/hooks/useManagers";
import { useMetrics, useCreateMetric } from "@/hooks/useMetrics";

const clientDataSchema = z.object({
  data: z.string()
    .trim()
    .min(1, "Данные не могут быть пустыми")
    .max(5000, "Данные не должны превышать 5000 символов")
});

const newClientSchema = z.object({
  companyName: z.string()
    .trim()
    .min(1, "Название компании обязательно")
    .max(100, "Название не должно превышать 100 символов"),
  clientName: z.string()
    .trim()
    .min(1, "Имя клиента обязательно")
    .max(100, "Имя не должно превышать 100 символов"),
  phone: z.string()
    .trim()
    .min(1, "Контактный номер обязателен")
    .max(20, "Номер не должен превышать 20 символов")
});

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [period, setPeriod] = useState("2025-10");
  const [viewMode, setViewMode] = useState<"month" | "half_year" | "year">("month");
  const [showClientCard, setShowClientCard] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clientData, setClientData] = useState("");
  const [reportPeriod, setReportPeriod] = useState("2025-10");
  const [aiStatus, setAiStatus] = useState("active");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewMetrics, setPreviewMetrics] = useState<{
    conversion: number;
    autonomy: number;
    financial_equiv: number;
    retention_share: number;
    satisfaction: number;
    business_hours_appointments: number;
    non_business_hours_appointments: number;
    avg_response_speed_seconds: number;
  } | null>(null);

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: selectedClient } = useClient(selectedClientId);
  const { data: managers = [] } = useManagers();
  const { data: metrics = [] } = useMetrics(selectedClientId, viewMode === "month" ? period : viewMode);
  const updateClient = useUpdateClient();
  const createClient = useCreateClient();
  const createMetric = useCreateMetric();

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
  
  const latestMetric = metrics[metrics.length - 1] || {
    conversion: 0,
    autonomy: 0,
    financial_equiv: 0,
    retention_share: 0,
    satisfaction: 0,
    business_hours_appointments: 0,
    non_business_hours_appointments: 0,
    avg_response_speed_seconds: 0,
  };

  // Set first client as selected when clients load
  if (clients.length > 0 && !selectedClientId) {
    setSelectedClientId(clients[0].id);
  }


  const parseMetricsData = (data: string) => {
    const conversionMatch = data.match(/конверси[яи][\s:]+(\d+[.,]?\d*)/i);
    const autonomyMatch = data.match(/автономност[ьи][\s:]+(\d+[.,]?\d*)/i);
    const financialMatch = data.match(/эконом[иія]+[\s:]+(\d+[.,]?\d*)/i);
    const retentionMatch = data.match(/повторн[ыхе]+[\s:]+(\d+[.,]?\d*)/i);
    const satisfactionMatch = data.match(/удовлетворенност[ьи][\s:]+(\d+[.,]?\d*)/i);
    const businessHoursMatch = data.match(/рабоч[иеа]+\s+врем[яи]+[\s:]+(\d+)/i);
    const nonBusinessHoursMatch = data.match(/нерабоч[иеа]+\s+врем[яи]+[\s:]+(\d+)/i);
    const responseSpeedMatch = data.match(/скорост[ьи]\s+ответ[аов]+[\s:]+(\d+)/i);

    return {
      conversion: conversionMatch ? parseFloat(conversionMatch[1].replace(',', '.')) / 100 : 0,
      autonomy: autonomyMatch ? parseFloat(autonomyMatch[1].replace(',', '.')) / 100 : 0,
      financial_equiv: financialMatch ? parseInt(financialMatch[1].replace(/[.,]/g, '')) : 0,
      retention_share: retentionMatch ? parseFloat(retentionMatch[1].replace(',', '.')) / 100 : 0,
      satisfaction: satisfactionMatch ? parseFloat(satisfactionMatch[1].replace(',', '.')) / 100 : 0,
      business_hours_appointments: businessHoursMatch ? parseInt(businessHoursMatch[1]) : 0,
      non_business_hours_appointments: nonBusinessHoursMatch ? parseInt(nonBusinessHoursMatch[1]) : 0,
      avg_response_speed_seconds: responseSpeedMatch ? parseInt(responseSpeedMatch[1]) : 0,
    };
  };

  const handlePreviewData = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = clientDataSchema.safeParse({ data: clientData });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (!selectedClientId) {
      toast.error("Выберите клиента");
      return;
    }

    if (!reportPeriod) {
      toast.error("Выберите период отчета");
      return;
    }

    const parsedMetrics = parseMetricsData(clientData);
    setPreviewMetrics(parsedMetrics);
    setShowPreview(true);
  };

  const handleConfirmSave = async () => {
    if (!previewMetrics) return;

    try {
      await createMetric.mutateAsync({
        client_id: selectedClientId,
        date: new Date().toISOString().split('T')[0],
        period_type: reportPeriod,
        conversion: previewMetrics.conversion,
        autonomy: previewMetrics.autonomy,
        financial_equiv: previewMetrics.financial_equiv,
        retention_share: previewMetrics.retention_share,
        satisfaction: previewMetrics.satisfaction,
        business_hours_appointments: previewMetrics.business_hours_appointments,
        non_business_hours_appointments: previewMetrics.non_business_hours_appointments,
        avg_response_speed_seconds: previewMetrics.avg_response_speed_seconds,
      });

      setClientData("");
      setReportPeriod("2025-10");
      setShowPreview(false);
      setPreviewMetrics(null);
    } catch (error) {
      console.error("Error saving metrics:", error);
      toast.error("Ошибка при сохранении метрики");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setAiStatus(newStatus);
    if (selectedClientId) {
      await updateClient.mutateAsync({
        id: selectedClientId,
        updates: { status: newStatus },
      });
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = newClientSchema.safeParse({
      companyName: newCompanyName,
      clientName: newClientName,
      phone: newPhone
    });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    await createClient.mutateAsync({
      company_name: newCompanyName,
      client_name: newClientName,
      manager_name: null,
      phone: newPhone
    });
    
    setNewCompanyName("");
    setNewClientName("");
    setNewPhone("");
    setShowCreateForm(false);
  };

  const handleManagerChange = async (managerName: string) => {
    if (!selectedClientId) return;
    
    await updateClient.mutateAsync({
      id: selectedClientId,
      updates: { manager_name: managerName === "unassigned" ? null : managerName },
    });
  };

  if (clientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (clients.length === 0 && !showCreateForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-xl font-light mb-4">Нет клиентов в системе</h2>
          <p className="text-muted-foreground mb-6">Добавьте первого клиента для начала работы</p>
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="w-full"
            variant="secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить клиента
          </Button>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowCreateForm(false)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-light mb-6">Добавить нового клиента</h2>
            <form onSubmit={handleCreateClient} className="space-y-6">
              <div>
                <Label htmlFor="companyName">Название компании</Label>
                <Input
                  id="companyName"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="ООО Компания"
                  className="mt-2"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="clientName">Имя клиента</Label>
                <Input
                  id="clientName"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="mt-2"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="phone">Контактный номер</Label>
                <Input
                  id="phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="mt-2"
                  maxLength={20}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                variant="secondary"
                disabled={createClient.isPending}
              >
                {createClient.isPending ? "Создание..." : "Создать клиента"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (showClientCard) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={() => setShowClientCard(false)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Вернуться к дашборду
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>

          <Card className="bg-card text-foreground p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-light mb-8 pb-4 border-b border-border">
              Карточка клиента
            </h2>

            <div className="space-y-6">
              <Card className="bg-muted border p-4 rounded-xl">
                <div className="flex items-start space-x-4">
                  <Users className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <Label className="text-sm text-foreground/70 mb-2 block">Закрепленный менеджер</Label>
                    <Select 
                      value={selectedClient?.manager_name || "unassigned"} 
                      onValueChange={handleManagerChange}
                    >
                      <SelectTrigger className="bg-background border text-foreground rounded-lg h-12">
                        <SelectValue placeholder="Выберите менеджера" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-lg z-[100]">
                        <SelectItem value="unassigned">Не назначен</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.name} className="cursor-pointer">
                            {manager.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="bg-muted border p-4 flex items-start space-x-4 rounded-xl">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-foreground/70">Название компании</p>
                  <p className="text-xl font-light text-foreground">{selectedClient?.company_name}</p>
                </div>
              </Card>

              <Card className="bg-muted border p-4 flex items-start space-x-4 rounded-xl">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-foreground/70">Имя клиента</p>
                  <p className="text-xl font-light text-foreground">{selectedClient?.client_name || "Не указано"}</p>
                </div>
              </Card>

              <Card className="bg-muted border p-4 rounded-xl">
                <div className="flex items-start space-x-4 mb-4">
                  <MessageSquare className="w-8 h-8 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground/70">Контактный телефон</p>
                    <p className="text-xl font-light text-foreground">{selectedClient?.phone || "Не указан"}</p>
                  </div>
                </div>
                
                {selectedClient?.phone && (() => {
                  try {
                    const phoneNumber = parsePhoneNumber(selectedClient.phone, 'RU');
                    if (phoneNumber.isValid()) {
                      const cleanNumber = phoneNumber.number.replace(/\+/g, '');
                      const message = encodeURIComponent(`Здравствуйте! Это сообщение от ${selectedClient.company_name}.`);
                      
                      const handleWhatsAppClick = () => {
                        // Try web.whatsapp.com instead of wa.me if blocked
                        window.open(`https://web.whatsapp.com/send?phone=${cleanNumber}&text=${message}`, '_blank');
                      };
                      
                      return (
                        <button
                          onClick={handleWhatsAppClick}
                          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-3 shadow-md transition transform hover:scale-105"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="font-medium">Написать в WhatsApp</span>
                        </button>
                      );
                    }
                  } catch (error) {
                    console.error('Invalid phone number:', error);
                  }
                  return (
                    <div className="flex items-center justify-center gap-2 w-full bg-muted border border-border text-muted-foreground rounded-lg py-3">
                      <MessageSquare className="w-5 h-5" />
                      <span>Некорректный номер телефона</span>
                    </div>
                  );
                })()}
              </Card>

              <h3 className="text-2xl font-light mt-10 pt-5 border-t border-border">
                Доступ в личный кабинет
              </h3>

              <Card className="bg-muted border p-6 space-y-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <p className="text-sm text-foreground/70">Email клиента:</p>
                  <p className="text-lg font-mono text-foreground">Связан с аккаунтом</p>
                </div>
                <div className="text-sm text-muted-foreground mt-4 p-3 bg-background rounded-lg border border-border">
                  <p>Для сброса пароля используйте функцию восстановления пароля в системе аутентификации.</p>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить клиента
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card text-foreground p-6 lg:col-span-1 rounded-2xl shadow-lg">
            <h3 className="text-xl font-light mb-4 pb-3 border-b border-border">
              Выбор клиента
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground mb-2 block">Компания</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="bg-muted border text-foreground rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Статус ИИ</Label>
                <Select value={aiStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-muted border text-foreground rounded-lg">
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-border gap-4">
              <Button
                variant="outline"
                size="lg"
                className="text-2xl font-light h-auto py-3 px-6"
                onClick={() => setShowClientCard(true)}
              >
                {selectedClient?.company_name}
              </Button>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Повторные клиенты"
                value={`${(latestMetric.retention_share * 100).toFixed(1)}%`}
                icon={Users}
                gradient="green"
              />
              <KpiCard
                title="Средняя скорость ответа"
                value={`${latestMetric.avg_response_speed_seconds} сек`}
                icon={Clock}
                gradient="cyan"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {viewMode !== "month" && (
                <>
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
                </>
              )}
              <GaugeChartCard
                title="Удовлетворенность клиента"
                value={latestMetric.satisfaction}
                icon={<Smile className="h-4 w-4 text-muted-foreground" />}
              />
              <DoughnutChartCard
                title="Новые / Повторные клиенты"
                data={[
                  { name: "Повторные", value: Number((latestMetric.retention_share * 100).toFixed(1)) },
                  { name: "Новые", value: Number(((1 - latestMetric.retention_share) * 100).toFixed(1)) },
                ]}
                colors={["hsl(280 70% 60%)", "hsl(189 94% 43%)"]}
              />
              <DoughnutChartCard
                title="Записи по времени"
                data={[
                  { name: "Рабочее время", value: latestMetric.business_hours_appointments },
                  { name: "Нерабочее время", value: latestMetric.non_business_hours_appointments },
                ]}
                colors={["hsl(189 94% 43%)", "hsl(280 70% 60%)"]}
              />
            </div>
          </div>
        </div>

        <Card className="bg-card text-foreground p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-light mb-4 pb-3 border-b border-border">
            Внесение данных клиента за период
          </h3>
          <form onSubmit={handlePreviewData} className="space-y-4">
            <div>
              <Label htmlFor="reportPeriod">Период отчета</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="mt-2">
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
            </div>
            
            <div>
              <Label htmlFor="clientData">Данные клиента</Label>
                <Textarea
                id="clientData"
                className="bg-muted border text-foreground mt-2 rounded-lg"
                rows={8}
                placeholder="Вставьте данные клиента (например: конверсия 75%, автономность 85%, экономия 50000, повторные 45%, удовлетворенность 90%, рабочее время 120, нерабочее время 30, скорость ответа 15)"
                value={clientData}
                onChange={(e) => setClientData(e.target.value)}
                maxLength={5000}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {clientData.length}/5000 символов
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-lg" 
              variant="secondary"
            >
              Предпросмотр метрик
            </Button>
          </form>
        </Card>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light">Предпросмотр распознанных метрик</DialogTitle>
              <DialogDescription>
                Проверьте правильность распознанных данных перед сохранением
              </DialogDescription>
            </DialogHeader>

            {previewMetrics && (
              <div className="space-y-4">
                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Конверсия в запись</span>
                    </div>
                    {previewMetrics.conversion > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{(previewMetrics.conversion * 100).toFixed(1)}%</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-500" />
                      <span className="font-medium">Автономность</span>
                    </div>
                    {previewMetrics.autonomy > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{(previewMetrics.autonomy * 100).toFixed(1)}%</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RussianRuble className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Экономия</span>
                    </div>
                    {previewMetrics.financial_equiv > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{previewMetrics.financial_equiv.toLocaleString()} ₽</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Повторные клиенты</span>
                    </div>
                    {previewMetrics.retention_share > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{(previewMetrics.retention_share * 100).toFixed(1)}%</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smile className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Удовлетворенность клиента</span>
                    </div>
                    {previewMetrics.satisfaction > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{(previewMetrics.satisfaction * 100).toFixed(1)}%</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-500" />
                      <span className="font-medium">Записи в рабочее время</span>
                    </div>
                    {previewMetrics.business_hours_appointments > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{previewMetrics.business_hours_appointments}</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Записи в нерабочее время</span>
                    </div>
                    {previewMetrics.non_business_hours_appointments > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{previewMetrics.non_business_hours_appointments}</p>
                </Card>

                <Card className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Средняя скорость ответа</span>
                    </div>
                    {previewMetrics.avg_response_speed_seconds > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-2xl font-light">{previewMetrics.avg_response_speed_seconds} сек</p>
                </Card>

                {(previewMetrics.conversion === 0 || previewMetrics.autonomy === 0 || 
                  previewMetrics.financial_equiv === 0 || previewMetrics.retention_share === 0 ||
                  previewMetrics.satisfaction === 0 || previewMetrics.business_hours_appointments === 0 ||
                  previewMetrics.non_business_hours_appointments === 0 || previewMetrics.avg_response_speed_seconds === 0) && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">Некоторые метрики не распознаны</p>
                      <p className="text-muted-foreground mt-1">
                        Убедитесь, что данные содержат ключевые слова: конверсия, автономность, экономия, повторные, удовлетворенность, рабочее время, нерабочее время, скорость ответа
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Отмена
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleConfirmSave}
                disabled={createMetric.isPending}
              >
                {createMetric.isPending ? "Сохранение..." : "Подтвердить и сохранить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
