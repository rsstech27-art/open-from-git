export interface MetricsData {
  date: string;
  conversion: number;
  autonomy: number;
  financial_equiv: number;
  retention_share: number;
}

export interface ClientDetails {
  id: string;
  name: string;
  phone: string;
  manager: string;
  login: string;
  status: "active" | "paused" | "inactive";
}

export const dummyClientDetails: Record<string, ClientDetails> = {
  client1: {
    id: "client1",
    name: "Красота и Здоровье",
    phone: "+7 (999) 123-45-67",
    manager: "Анна Смирнова",
    login: "client1@example.com",
    status: "active",
  },
  client2: {
    id: "client2",
    name: "Техно Сервис",
    phone: "+7 (999) 765-43-21",
    manager: "Игорь Петров",
    login: "client2@example.com",
    status: "active",
  },
};

function generateFakeData(startDate: Date, endDate: Date): MetricsData[] {
  const data: MetricsData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    data.push({
      date: currentDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      conversion: Math.random() * 0.3 + 0.1,
      autonomy: Math.random() * 0.4 + 0.5,
      financial_equiv: Math.floor(Math.random() * 15000 + 5000),
      retention_share: Math.random() * 0.3 + 0.4,
    });
    currentDate.setDate(currentDate.getDate() + 2);
  }

  return data;
}

export function generateFakeMetrics(period: string): MetricsData[] {
  const today = new Date();
  let startDate: Date;
  let data: MetricsData[];

  switch (period) {
    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      data = generateFakeData(startDate, today).slice(-4);
      return data;
    case "month":
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      data = generateFakeData(startDate, today).slice(-8);
      return data;
    case "half_year":
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      data = generateFakeData(startDate, today).slice(-12);
      return data;
    case "year":
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      data = generateFakeData(startDate, today).slice(-24);
      return data;
    default:
      return [];
  }
}
