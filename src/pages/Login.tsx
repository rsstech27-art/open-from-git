import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LoginType = "admin" | "client";

export default function Login() {
  const [loginType, setLoginType] = useState<LoginType>("admin");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success("Вход выполнен в демо-режиме");
    
    if (loginType === "admin") {
      navigate("/admin");
    } else {
      navigate("/client");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light text-primary">
            {isRegister ? "Регистрация" : "Вход"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Мой ИИ-ассистент - Дашборд
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={loginType === "admin" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setLoginType("admin")}
          >
            Администратор
          </Button>
          <Button
            type="button"
            variant={loginType === "client" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setLoginType("client")}
          >
            Клиент
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтверждение пароля</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            {isRegister ? "Зарегистрироваться" : "Войти"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-primary hover:underline"
          >
            {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
          </button>
        </div>
      </Card>
    </div>
  );
}
