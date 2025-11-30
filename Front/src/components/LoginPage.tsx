import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { AuthApiService } from "../services/authservice";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await AuthApiService.login({
        email: formData.email,
        password: formData.password,
      });

      if (!res.success) {
        alert(res.message || "Credenciales incorrectas");
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Inicio de sesión exitoso");
      onNavigate("dashboard");
    } catch (error: any) {
      alert(error.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A4E6A] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#0A4E6A]" />
            </button>
            <CardTitle className="text-[#0A4E6A]">Talento sin Barreras</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E86C4B] hover:bg-[#d45a39] text-white"
            >
              Iniciar sesión
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-[#0A4E6A] hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
