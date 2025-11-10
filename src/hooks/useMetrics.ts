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

      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "half_year":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .from("metrics")
        .select("*")
        .eq("client_id", clientId)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

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
