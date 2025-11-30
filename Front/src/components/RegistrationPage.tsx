import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { AuthApiService } from "../services/authservice";

interface RegistrationPageProps {
  onNavigate: (page: string) => void;
}

export function RegistrationPage({ onNavigate }: RegistrationPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    paternalSurname: "",
    maternalSurname: "",
    email: "",
    password: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nombre = `${formData.firstName} ${formData.paternalSurname} ${formData.maternalSurname}`;

      const res = await AuthApiService.register({
        nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.role,
      });

      if (!res.success) {
        alert(res.message || "Error al registrar");
        return;
      }

      alert("Registro exitoso");
      onNavigate("login"); // Cambiado a login en lugar de dashboard
    } catch (error: any) {
      alert(error.message || "Error en el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A4E6A] to-[#3E7D8C] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#0A4E6A]" />
            </button>
            <CardTitle className="text-[#0A4E6A]">Registro</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre(s)</Label>
              <Input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paternalSurname">Apellido paterno</Label>
              <Input
                id="paternalSurname"
                type="text"
                required
                value={formData.paternalSurname}
                onChange={(e) => setFormData({ ...formData, paternalSurname: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maternalSurname">Apellido materno</Label>
              <Input
                id="maternalSurname"
                type="text"
                required
                value={formData.maternalSurname}
                onChange={(e) => setFormData({ ...formData, maternalSurname: e.target.value })}
                className="border-gray-300"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="role">Rol de cuenta</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postulante">Postulante</SelectItem>
                  <SelectItem value="organismo">Organismo</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E86C4B] hover:bg-[#d45a39] text-white"
            >
              Enviar registro
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
