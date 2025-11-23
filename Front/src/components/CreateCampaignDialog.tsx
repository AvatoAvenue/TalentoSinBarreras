import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Plus } from "lucide-react";

interface Campaign {
  title: string;
  description: string;
  type: string;
  location: string;
  disabilities: string[];
  organization: string;
  requirements: string;
  benefits: string;
}

interface CreateCampaignDialogProps {
  onCreateCampaign: (campaign: Campaign) => void;
}

export function CreateCampaignDialog({
  onCreateCampaign,
}: CreateCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Campaign>({
    title: "",
    description: "",
    type: "",
    location: "",
    disabilities: [],
    organization: "",
    requirements: "",
    benefits: "",
  });

  const disabilityOptions = [
    { id: "visual", label: "Visual" },
    { id: "auditiva", label: "Auditiva" },
    { id: "motriz", label: "Motriz" },
    { id: "cognitiva", label: "Cognitiva" },
    { id: "multiple", label: "Múltiple" },
    { id: "todas", label: "Todas las capacidades" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCampaign(formData);
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      type: "",
      location: "",
      disabilities: [],
      organization: "",
      requirements: "",
      benefits: "",
    });
  };

  const toggleDisability = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      disabilities: prev.disabilities.includes(id)
        ? prev.disabilities.filter((d) => d !== id)
        : [...prev.disabilities, id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#E86C4B] hover:bg-[#d45a39] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Crear Nueva Campaña
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0A4E6A]">
            Crear Nueva Campaña
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para publicar una nueva oportunidad en la plataforma
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">
              Título de la campaña *
            </Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="Ej: Desarrollador Web Inclusivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organización *</Label>
            <Input
              id="organization"
              required
              value={formData.organization}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organization: e.target.value,
                })
              }
              placeholder="Nombre de tu organización"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de oportunidad *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleo">Empleo</SelectItem>
                <SelectItem value="servicio-social">
                  Servicio Social
                </SelectItem>
                <SelectItem value="voluntariado">
                  Voluntariado
                </SelectItem>
                <SelectItem value="practicas">
                  Prácticas Profesionales
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value,
                })
              }
              placeholder="Ciudad, Estado o Remoto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe la oportunidad en detalle"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  requirements: e.target.value,
                })
              }
              placeholder="Lista los requisitos necesarios"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Beneficios</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  benefits: e.target.value,
                })
              }
              placeholder="Describe los beneficios que ofreces"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Adaptaciones disponibles para:</Label>
            <div className="grid grid-cols-2 gap-3">
              {disabilityOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={option.id}
                    checked={formData.disabilities.includes(
                      option.id,
                    )}
                    onCheckedChange={() =>
                      toggleDisability(option.id)
                    }
                  />
                  <label
                    htmlFor={option.id}
                    className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#E86C4B] hover:bg-[#d45a39] text-white"
            >
              Publicar Campaña
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}