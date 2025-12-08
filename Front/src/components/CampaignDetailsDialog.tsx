import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Campaign } from "./Dashboard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Clock, Users, Eye, CheckCircle } from "lucide-react";
import { Separator } from "./ui/separator";

interface CampaignDetailsDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (campaign: Campaign) => void;
  onFollow?: (campaignId: number) => void;
  isFollowing?: boolean;
  hasApplied?: boolean;
}

export function CampaignDetailsDialog({
  campaign,
  open,
  onOpenChange,
  onApply,
  onFollow,
  isFollowing = false,
  hasApplied = false,
}: CampaignDetailsDialogProps) {
  if (!campaign) return null;

  const getDisabilityBadgeColor = (disability: string) => {
    const colors: Record<string, string> = {
      visual: "bg-blue-100 text-blue-800",
      auditiva: "bg-green-100 text-green-800",
      motriz: "bg-purple-100 text-purple-800",
      cognitiva: "bg-yellow-100 text-yellow-800",
      todas: "bg-gray-100 text-gray-800",
    };
    return colors[disability] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0A4E6A] text-2xl">
            {campaign.title}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-[#F5D27A] text-[#1F1F1F]">
              {campaign.organization}
            </Badge>
            <Badge variant="secondary">{campaign.type}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Descripción */}
          <div>
            <h3 className="font-medium text-[#0A4E6A] mb-2">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-line">{campaign.description}</p>
          </div>

          <Separator />

          {/* Detalles */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-[#0A4E6A] mb-2">Información general</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{campaign.location || "No especificado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{campaign.applicants || 0} postulantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{campaign.views || 0} vistas</span>
                  </div>
                </div>
              </div>

              {/* Etiquetas */}
              <div>
                <h3 className="font-medium text-[#0A4E6A] mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-[#0A4E6A] mb-2">Adaptaciones disponibles</h3>
              <div className="space-y-2">
                {campaign.disabilities && campaign.disabilities.length > 0 ? (
                  campaign.disabilities.map((disability, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="capitalize">{disability}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No se especificaron adaptaciones</p>
                )}
              </div>

              {/* Requisitos */}
              <div className="mt-6">
                <h3 className="font-medium text-[#0A4E6A] mb-2">Requisitos generales</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                  <li>Disponibilidad para comprometerse con la campaña</li>
                  <li>Interés en causas sociales y de inclusión</li>
                  <li>Buena disposición para trabajar en equipo</li>
                  <li>Responsabilidad y puntualidad</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-[#F5FAFA] p-4 rounded-lg border border-[#0A4E6A]/10">
            <h3 className="font-medium text-[#0A4E6A] mb-2">Beneficios</h3>
            <ul className="grid md:grid-cols-2 gap-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Certificado de participación</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Experiencia laboral validada</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Red de contactos profesionales</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Desarrollo de habilidades</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {onApply && (
            <Button
              onClick={() => onApply(campaign)}
              disabled={hasApplied}
              className={`${
                hasApplied
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-[#E86C4B] hover:bg-[#d45a39]"
              } text-white flex-1`}
            >
              {hasApplied ? "✓ Ya te has postulado" : "Postularse ahora"}
            </Button>
          )}
          
          {onFollow && (
            <Button
              variant="outline"
              onClick={() => onFollow(campaign.id)}
              className={`${
                isFollowing
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-[#0A4E6A] text-[#0A4E6A]"
              } flex-1`}
            >
              {isFollowing ? "✓ Siguiendo" : "Seguir campaña"}
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
