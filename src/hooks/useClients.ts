import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  manager_name: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!clientId,
  });
}

export function useClientByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ["client-by-user", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!userId,
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Данные клиента обновлены");
    },
    onError: (error) => {
      toast.error("Ошибка при обновлении данных");
      console.error(error);
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newClient: { company_name: string; manager_name: string; phone: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Не авторизован");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          company_name: newClient.company_name,
          manager_name: newClient.manager_name,
          phone: newClient.phone,
          user_id: user.id,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Клиент успешно добавлен");
    },
    onError: (error) => {
      toast.error("Ошибка при создании клиента");
      console.error(error);
    },
  });
}
