import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  client_name: string | null;
  manager_name: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  ai_status: string | null;
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
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { id: clientId, ...updateData } = { id, ...updates };
      const { data, error } = await supabase
        .from("clients")
        .update(updateData)
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate both queries to ensure data is refreshed
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", data.id] });
      queryClient.invalidateQueries({ queryKey: ["client-by-user", data.user_id] });
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
    mutationFn: async (newClient: { company_name: string; client_name: string; manager_name: string | null; phone: string; email?: string }) => {
      // Create a new user account for the client if email provided
      if (newClient.email) {
        const tempPassword = Math.random().toString(36).slice(-8);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newClient.email,
          password: tempPassword,
          options: {
            data: {
              full_name: newClient.client_name
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Не удалось создать пользователя");

        // Create client record linked to new user
        const { data, error } = await supabase
          .from("clients")
          .insert({
            company_name: newClient.company_name,
            client_name: newClient.client_name,
            manager_name: newClient.manager_name,
            phone: newClient.phone,
            user_id: authData.user.id,
            status: "active"
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // For testing - create without auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Не авторизован");

        const { data, error } = await supabase
          .from("clients")
          .insert({
            company_name: newClient.company_name,
            client_name: newClient.client_name,
            manager_name: newClient.manager_name,
            phone: newClient.phone,
            user_id: user.id,
            status: "active"
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
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

export function useUpdateClientEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, clientId, newEmail }: { userId: string; clientId: string; newEmail: string }) => {
      // Update email in auth.users via edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "update-user-email",
        {
          body: { userId, newEmail },
        }
      );

      if (functionError) throw functionError;
      if (!functionData.success) throw new Error(functionData.error || "Failed to update auth email");

      // Update email in clients table
      const { error: clientError } = await supabase
        .from("clients")
        .update({ email: newEmail })
        .eq("id", clientId);

      if (clientError) throw clientError;
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries to ensure data is refreshed
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.clientId] });
      toast.success("Email клиента успешно изменен");
    },
    onError: (error) => {
      console.error("Error updating client email:", error);
      toast.error("Не удалось изменить email клиента");
    },
  });
}
