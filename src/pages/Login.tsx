import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Неверный формат email").max(255, "Email слишком длинный"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").max(100, "Пароль слишком длинный"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(1, "Пожалуйста, укажите ваше имя").max(100, "Имя слишком длинное"),
});

const resetSchema = z.object({
  email: z.string().email("Неверный формат email").max(255, "Email слишком длинный"),
});

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { user, role, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(role === "admin" ? "/admin" : "/client", { replace: true });
    }
  }, [authLoading, user, role, navigate]);

  if (authLoading) {
    return null;
  }

  if (user && role) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const validation = registerSchema.safeParse({ email, password, fullName });
        
        if (!validation.success) {
          const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
          toast.error(firstError || "Проверьте введенные данные");
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Этот email уже зарегистрирован");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Регистрация успешна! Войдите в систему.");
          setIsRegister(false);
        }
      } else {
        const validation = loginSchema.safeParse({ email, password });
        
        if (!validation.success) {
          const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
          toast.error(firstError || "Проверьте введенные данные");
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Неверный email или пароль");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Вход выполнен успешно!");
        }
      }
    } catch (error) {
      toast.error("Произошла ошибка. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const validation = resetSchema.safeParse({ email: resetEmail });
      
      if (!validation.success) {
        const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
        toast.error(firstError || "Проверьте введенные данные");
        setResetLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Письмо для сброса пароля отправлено на ваш email");
        setIsResetDialogOpen(false);
        setResetEmail("");
      }
    } catch (error) {
      toast.error("Произошла ошибка. Попробуйте снова.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center p-4">
      {user && (
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      )}
      <Card className="w-full max-w-md p-8 space-y-6 neon-card backdrop-blur-sm bg-card/95">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light text-primary">
            {isRegister ? "Регистрация" : "Вход"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Мой ИИ-ассистент - Дашборд
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                type="text"
                required
                placeholder="Иван Иванов"
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="your@email.com"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              minLength={6}
              maxLength={100}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-primary hover:underline"
          >
            {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
          </button>

          {!isRegister && (
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="block w-full text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Забыли пароль?
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Восстановление пароля</DialogTitle>
                  <DialogDescription>
                    Введите ваш email, и мы отправим вам ссылку для сброса пароля.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      required
                      placeholder="your@email.com"
                      maxLength={255}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={resetLoading}>
                    {resetLoading ? "Отправка..." : "Отправить ссылку"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </Card>
    </div>
  );
}
