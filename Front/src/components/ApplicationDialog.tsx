import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Campaign } from "./Dashboard";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApplicationDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (campaignId: number, applicationData: any) => void;
  userId: number; // Solo userId, no voluntarioId
}

export function ApplicationDialog({
  campaign,
  open,
  onOpenChange,
  onApply,
  userId,
}: ApplicationDialogProps) {
  const [formData, setFormData] = useState({
    motivationLetter: "",
    experience: "",
    availability: "full-time",
    acceptTerms: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
      toast.success("Archivo PDF cargado correctamente");
    } else {
      toast.error("Por favor, sube un archivo PDF");
    }
  };

  const handleSubmit = async () => {
    console.log("DEBUG: Iniciando envío de postulación...");
    console.log("DEBUG:", { campaign, userId, formData });
    
    if (!campaign || !userId) {
      console.error("DEBUG: Falta campaign o userId");
      toast.error("Error: Faltan datos necesarios");
      return;
    }

    // Validaciones
    if (!formData.motivationLetter.trim()) {
      toast.error("Por favor, escribe una carta de motivación");
      return;
    }

    if (formData.motivationLetter.length < 50) {
      toast.error("La carta de motivación debe tener al menos 50 caracteres");
      return;
    }

    if (!formData.experience.trim()) {
      toast.error("Por favor, describe tu experiencia");
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("DEBUG: Enviando a:", `${API_BASE_URL}/postulaciones`);
      console.log("DEBUG: Datos a enviar:", {
        userId: userId,
        idCampania: campaign.id,
        cartaMotivacion: formData.motivationLetter,
        experiencia: formData.experience,
        disponibilidad: formData.availability,
        cvFileName: cvFile?.name || "cv.pdf",
      });

      const response = await fetch(`${API_BASE_URL}/postulaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          idCampania: campaign.id,
          cartaMotivacion: formData.motivationLetter,
          experiencia: formData.experience,
          disponibilidad: formData.availability,
          cvFileName: cvFile?.name || "cv.pdf",
        }),
      });

      console.log("DEBUG: Response status:", response.status);
      const data = await response.json();
      console.log("DEBUG: Response data:", data);

      if (data.success) {
        // Notificar al componente padre
        onApply(campaign.id, {
          ...formData,
          cvFileName: cvFile?.name || "cv.pdf",
          cvSize: cvFile?.size || 0,
          appliedDate: new Date().toISOString(),
        });

        toast.success("¡Postulación enviada exitosamente!");
        onOpenChange(false);

        // Resetear formulario
        setFormData({
          motivationLetter: "",
          experience: "",
          availability: "full-time",
          acceptTerms: false,
        });
        setCvFile(null);
      } else {
        console.error("DEBUG: Error del backend:", data.message);
        toast.error(data.message || "Error al enviar la postulación");
      }
    } catch (error) {
      console.error("DEBUG: Error de conexión:", error);
      toast.error("Error de conexión al enviar la postulación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0A4E6A]">
            Postularse a: {campaign?.title || "Campaña"}
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para postularte a esta campaña. Todos los campos son requeridos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información de la campaña */}
          {campaign && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-[#0A4E6A] mb-2">Información de la campaña</h4>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Organización:</strong> {campaign.organization}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Ubicación:</strong> {campaign.location}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tipo:</strong> {campaign.type}
              </p>
            </div>
          )}

          {/* Carta de motivación */}
          <div className="space-y-2">
            <Label htmlFor="motivationLetter">Carta de motivación *</Label>
            <Textarea
              id="motivationLetter"
              placeholder="Explica por qué quieres postularte a esta campaña, qué te motiva y qué esperas lograr..."
              value={formData.motivationLetter}
              onChange={(e) => handleInputChange("motivationLetter", e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className={`text-xs ${formData.motivationLetter.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
              Mínimo 50 caracteres. Actual: {formData.motivationLetter.length}
            </p>
          </div>

          {/* Experiencia */}
          <div className="space-y-2">
            <Label htmlFor="experience">Experiencia relevante *</Label>
            <Textarea
              id="experience"
              placeholder="Describe tu experiencia, habilidades y conocimientos relevantes para esta campaña..."
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Disponibilidad */}
          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilidad *</Label>
            <Select
              value={formData.availability}
              onValueChange={(value) => handleInputChange("availability", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Tiempo completo</SelectItem>
                <SelectItem value="part-time">Medio tiempo</SelectItem>
                <SelectItem value="flexible">Horario flexible</SelectItem>
                <SelectItem value="weekends">Fines de semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subir CV */}
          <div className="space-y-2">
            <Label htmlFor="cv">CV (PDF) *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="cv"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isSubmitting}
              />
              {cvFile && (
                <span className="text-sm text-green-600">
                  ✓ {cvFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Máximo 5MB. Solo se aceptan archivos PDF.
            </p>
          </div>

          {/* Términos y condiciones */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-sm">
              Acepto los términos y condiciones, y autorizo el tratamiento de mis datos personales
              según la política de privacidad.
            </Label>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Información importante</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
              <li>Recibirás una confirmación por correo electrónico</li>
              <li>La organización revisará tu postulación</li>
              <li>Recibirás notificaciones sobre el estado de tu postulación</li>
              <li>Puedes dar seguimiento en "Mis Postulaciones"</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              console.log("Cancelando...");
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              console.log("Botón de enviar clickeado");
              handleSubmit();
            }}
            disabled={isSubmitting}
            className="bg-[#E86C4B] hover:bg-[#d45a39] text-white"
          >
            {isSubmitting ? "Enviando..." : "Enviar postulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
