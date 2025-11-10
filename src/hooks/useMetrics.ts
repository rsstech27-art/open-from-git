import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Metric {
  id: string;
  client_id: string;
  date: string;
  conversion: number;
  autonomy: number;
  financial_equiv: number;
  retention_share: number;
  period_type: string | null;
  created_at: string;
}

export function useMetrics(clientId: string | undefined, period: string) {
  return useQuery({
    queryKey: ["metrics", clientId, period],
    queryFn: async () => {
      if (!clientId) return [];

      let query = supabase
        .from("metrics")
        .select("*")
        .eq("client_id", clientId);

      // If period is a specific month (YYYY-MM format), filter by period_type
      if (period.match(/^\d{4}-\d{2}$/)) {
        query = query.eq("period_type", period);
      } else if (period === "half_year") {
        // Get last 6 months of data - get all metrics and filter by period_type
        const now = new Date(2025, 9, 1); // Start from October 2025
        const periods: string[] = [];
        for (let i = 0; i < 6; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() + i);
          periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        }
        query = query.in("period_type", periods);
      } else if (period === "year") {
        // Get last 12 months of data
        const now = new Date(2025, 9, 1); // Start from October 2025
        const periods: string[] = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() + i);
          periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        }
        query = query.in("period_type", periods);
      }

      const { data, error } = await query.order("date", { ascending: true });

      if (error) throw error;
      return data as Metric[];
    },
    enabled: !!clientId,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metric: Omit<Metric, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("metrics")
        .insert(metric)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast.success("Метрика добавлена");
    },
    onError: (error) => {
      toast.error("Ошибка при добавлении метрики");
      console.error(error);
    },
  });
}
