import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "client";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useUserRole] Effect triggered, user:', user?.id);
    
    if (!user) {
      console.log('[useUserRole] No user, clearing role');
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      console.log('[useUserRole] Fetching role for user:', user.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log('[useUserRole] Role fetched:', data, 'error:', error);
      
      if (data) {
        setRole(data.role as UserRole);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return { role, loading };
}
