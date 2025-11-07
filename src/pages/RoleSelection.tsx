import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useUserRole";

export default function RoleSelection() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoleSelect = async (role: UserRole) => {
    if (!user) {
      toast.error("Пользователь не найден");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: role,
        });

      if (error) throw error;

      toast.success("Роль установлена");
      
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/client");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка при установке роли");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light text-primary">
            Выберите роль
          </h1>
          <p className="text-sm text-muted-foreground">
            Выберите вашу роль в системе
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleRoleSelect("admin")}
            className="w-full h-24 text-lg"
            disabled={loading}
            variant="secondary"
          >
            Администратор
          </Button>
          
          <Button
            onClick={() => handleRoleSelect("client")}
            className="w-full h-24 text-lg"
            disabled={loading}
          >
            Клиент
          </Button>
        </div>
      </Card>
    </div>
  );
}
