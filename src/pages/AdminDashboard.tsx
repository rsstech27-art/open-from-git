import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MessageSquare, TrendingUp, Users, LogOut, Plus, CheckCircle2, AlertCircle, Smile, Clock } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import GaugeChartCard from "@/components/dashboard/GaugeChartCard";
import { toast } from "sonner";
import { z } from "zod";
import { parsePhoneNumber } from 'libphonenumber-js';
import { useAuth } from "@/contexts/AuthContext";
import { useClients, useClient, useUpdateClient, useCreateClient, useUpdateClientEmail } from "@/hooks/useClients";
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
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: selectedClient } = useClient(selectedClientId);
  const { data: managers = [] } = useManagers();
  const { data: metrics = [] } = useMetrics(selectedClientId, viewMode === "month" ? period : viewMode);
  const updateClient = useUpdateClient();
  const createClient = useCreateClient();
  const createMetric = useCreateMetric();
  const updateClientEmail = useUpdateClientEmail();

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
      return {
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
      };
    }

    if (viewMode === "month") {
      // For month view, use the latest metric
      return metrics[metrics.length - 1];
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

  // Set first client as selected when clients load
  if (clients.length > 0 && !selectedClientId) {
    setSelectedClientId(clients[0].id);
    setAiStatus(clients[0].ai_status || "active");
  }

  // Update AI status when selected client changes
  useEffect(() => {
    if (selectedClient) {
      setAiStatus(selectedClient.ai_status || "active");
    }
  }, [selectedClient?.id, selectedClient?.ai_status]);


  const parseMetricsData = (data: string) => {
    const conversionMatch = data.match(/конверси[яи][\s:]+(\d+[.,]?\d*)/i);
    const autonomyMatch = data.match(/автономност[ьи][\s:]+(\d+[.,]?\d*)/i);
    const timeSavedMatch = data.match(/эконом[иія]+[\s:]+(\d+)/i);
    const confirmedAppointmentsMatch = data.match(/(?:подтвержд[ыхе]+|запис[ьияе]+)[\s:]+(\d+)/i);
    const satisfactionMatch = data.match(/удовлетворенност[ьи][\s:]+(\d+[.,]?\d*)/i);
    const businessHoursMatch = data.match(/рабоч[иеа]+\s+врем[яи]+[\s:]+(\d+)/i);
    const nonBusinessHoursMatch = data.match(/нерабоч[иеа]+\s+врем[яи]+[\s:]+(\d+)/i);

    return {
      conversion: conversionMatch ? parseFloat(conversionMatch[1].replace(',', '.')) / 100 : 0,
      autonomy: autonomyMatch ? parseFloat(autonomyMatch[1].replace(',', '.')) / 100 : 0,
      time_saved_hours: timeSavedMatch ? parseInt(timeSavedMatch[1]) : 0,
      confirmed_appointments: confirmedAppointmentsMatch ? parseInt(confirmedAppointmentsMatch[1]) : 0,
      satisfaction: satisfactionMatch ? parseFloat(satisfactionMatch[1].replace(',', '.')) / 100 : 0,
      business_hours_appointments: businessHoursMatch ? parseInt(businessHoursMatch[1]) : 0,
      non_business_hours_appointments: nonBusinessHoursMatch ? parseInt(nonBusinessHoursMatch[1]) : 0,
      short_dialogs: 0,
      medium_dialogs: 0,
      long_dialogs: 0,
    };
  };

  const handleSaveData = async (e: React.FormEvent) => {
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

    try {
      await createMetric.mutateAsync({
        client_id: selectedClientId,
        date: new Date().toISOString().split('T')[0],
        period_type: reportPeriod,
        conversion: parsedMetrics.conversion,
        autonomy: parsedMetrics.autonomy,
        time_saved_hours: parsedMetrics.time_saved_hours,
        confirmed_appointments: parsedMetrics.confirmed_appointments,
        satisfaction: parsedMetrics.satisfaction,
        business_hours_appointments: parsedMetrics.business_hours_appointments,
        non_business_hours_appointments: parsedMetrics.non_business_hours_appointments,
        short_dialogs: parsedMetrics.short_dialogs,
        medium_dialogs: parsedMetrics.medium_dialogs,
        long_dialogs: parsedMetrics.long_dialogs,
      });

      setClientData("");
      setReportPeriod("2025-10");
    } catch (error) {
      console.error("Error saving metrics:", error);
      toast.error("Ошибка при сохранении метрики");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedClientId) return;
    
    setAiStatus(newStatus);
    
    try {
      await updateClient.mutateAsync({
        id: selectedClientId,
        ai_status: newStatus,
      });
      toast.success("Статус ИИ обновлен");
    } catch (error) {
      console.error("Error updating AI status:", error);
      toast.error("Ошибка при обновлении статуса");
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

  const handleUpdateEmail = async () => {
    if (!selectedClient) {
      toast.error("Клиент не выбран");
      return;
    }

    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Введите корректный email");
      return;
    }

    try {
      await updateClientEmail.mutateAsync({
        userId: selectedClient.user_id,
        clientId: selectedClient.id,
        newEmail: newEmail,
      });
      setShowEmailDialog(false);
      setNewEmail("");
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handleManagerChange = async (managerName: string) => {
    if (!selectedClientId) return;
    
    await updateClient.mutateAsync({
      id: selectedClientId,
      manager_name: managerName === "unassigned" ? null : managerName,
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
      <>
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
                        const message = encodeURIComponent('Здравствуйте, это Анна! Я пишу Вам по поводу работы вашего ИИ-ассистента.');
                        
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-foreground/70 mb-1">Email клиента:</p>
                      <p className="text-lg font-mono text-foreground">{selectedClient?.email || "Не указан"}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewEmail(selectedClient?.email || "");
                        setShowEmailDialog(true);
                      }}
                    >
                      Изменить email
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-4 p-3 bg-background rounded-lg border border-border">
                    <p>При изменении email клиента будут обновлены данные для входа в систему.</p>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>

        {/* Email Update Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Изменить email клиента</DialogTitle>
              <DialogDescription>
                Новый email будет использоваться для входа в систему
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-email">Новый email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleUpdateEmail}
                disabled={updateClientEmail.isPending}
              >
                {updateClientEmail.isPending ? "Изменение..." : "Изменить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
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
                title="Количество диалогов"
                value={`${(aggregatedMetric.short_dialogs || 0) + (aggregatedMetric.medium_dialogs || 0) + (aggregatedMetric.long_dialogs || 0)} шт`}
                icon={Users}
                gradient="green"
              />
            </div>

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
                title="Записи по времени"
                data={[
                  { name: "Рабочее время", value: aggregatedMetric.business_hours_appointments },
                  { name: "Нерабочее время", value: aggregatedMetric.non_business_hours_appointments },
                ]}
                colors={["hsl(280 70% 60%)", "hsl(330 85% 65%)"]}
              />
            </div>
          </div>
        </div>

        <Card className="bg-card text-foreground p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-light mb-4 pb-3 border-b border-border">
            Внесение данных клиента за период
          </h3>
          <form onSubmit={handleSaveData} className="space-y-4">
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
                placeholder="Вставьте данные клиента (например: конверсия 75%, автономность 85%, экономия 50000, повторные 45%, удовлетворенность 90%, рабочее время 120, нерабочее время 30)"
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
              disabled={createMetric.isPending}
            >
              {createMetric.isPending ? "Сохранение..." : "Сохранить метрики"}
            </Button>
          </form>
        </Card>

        {/* Email Update Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Изменить email клиента</DialogTitle>
              <DialogDescription>
                Новый email будет использоваться для входа в систему
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-email">Новый email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleUpdateEmail}
                disabled={updateClientEmail.isPending}
              >
                {updateClientEmail.isPending ? "Изменение..." : "Изменить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
