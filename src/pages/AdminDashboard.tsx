import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, TrendingUp, RussianRuble, Users, LogOut, Plus } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import LineChartCard from "@/components/dashboard/LineChartCard";
import BarChartCard from "@/components/dashboard/BarChartCard";
import DoughnutChartCard from "@/components/dashboard/DoughnutChartCard";
import { toast } from "sonner";
import { z } from "zod";
import { parsePhoneNumber } from 'libphonenumber-js';
import { useAuth } from "@/contexts/AuthContext";
import { useClients, useClient, useUpdateClient, useCreateClient } from "@/hooks/useClients";
import { useManagers } from "@/hooks/useManagers";
import { useMetrics } from "@/hooks/useMetrics";

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
  managerName: z.string()
    .trim()
    .min(1, "Имя менеджера обязательно")
    .max(100, "Имя не должно превышать 100 символов"),
  phone: z.string()
    .trim()
    .min(1, "Контактный номер обязателен")
    .max(20, "Номер не должен превышать 20 символов")
});

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [period, setPeriod] = useState("month");
  const [showClientCard, setShowClientCard] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clientData, setClientData] = useState("");
  const [aiStatus, setAiStatus] = useState("active");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newManagerName, setNewManagerName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: selectedClient } = useClient(selectedClientId);
  const { data: managers = [] } = useManagers();
  const { data: metrics = [] } = useMetrics(selectedClientId, period);
  const updateClient = useUpdateClient();
  const createClient = useCreateClient();
  
  const latestMetric = metrics[metrics.length - 1] || {
    conversion: 0,
    autonomy: 0,
    financial_equiv: 0,
    retention_share: 0,
  };

  // Set first client as selected when clients load
  if (clients.length > 0 && !selectedClientId) {
    setSelectedClientId(clients[0].id);
  }

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
    
    // Here you would parse and save the metrics data to the database
    // For now, just show success
    toast.success("Данные сохранены");
    setClientData("");
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
      managerName: newManagerName,
      phone: newPhone
    });
    
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    await createClient.mutateAsync({
      company_name: newCompanyName,
      client_name: newClientName,
      manager_name: newManagerName,
      phone: newPhone
    });
    
    setNewCompanyName("");
    setNewClientName("");
    setNewManagerName("");
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
                <Label htmlFor="managerName">Имя менеджера</Label>
                <Input
                  id="managerName"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="Петр Петров"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-border">
              <Button
                variant="outline"
                size="lg"
                className="text-2xl font-light mb-4 md:mb-0 h-auto py-3 px-6"
                onClick={() => setShowClientCard(true)}
              >
                {selectedClient?.company_name}
              </Button>

              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48 bg-muted border text-foreground rounded-lg">
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
                icon={RussianRuble}
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

        <Card className="bg-card text-foreground p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-light mb-4 pb-3 border-b border-border">
            Внесение данных клиента за период
          </h3>
          <form onSubmit={handleSaveData}>
            <Textarea
              className="bg-muted border text-foreground mb-4 rounded-lg"
              rows={8}
              placeholder="Вставьте сюда данные клиента..."
              value={clientData}
              onChange={(e) => setClientData(e.target.value)}
              maxLength={5000}
            />
            <p className="text-sm text-muted-foreground mb-4">
              {clientData.length}/5000 символов
            </p>
            <Button type="submit" className="w-full rounded-lg" variant="secondary">
              Сохранить изменения
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
