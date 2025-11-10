import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

export function useAuthRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('[useAuthRedirect] State:', { 
      authLoading, 
      roleLoading, 
      hasUser: !!user, 
      role,
      hasRedirected: hasRedirected.current 
    });
    
    // Only redirect once and when both auth and role are loaded
    if (!authLoading && !roleLoading && user && role && !hasRedirected.current) {
      console.log('[useAuthRedirect] Redirecting to:', role === "admin" ? "/admin" : "/client");
      hasRedirected.current = true;
      
      // Use setTimeout to ensure navigation happens after current render
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "client") {
          navigate("/client", { replace: true });
        }
      }, 0);
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  return { loading: authLoading || roleLoading };
}
