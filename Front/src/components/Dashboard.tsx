import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Menu,
  Search,
  User,
  Heart,
  Filter,
  Check,
  UserPlus,
  Settings,
  Home,
  FileText,
  Star,
  Plus,
  Eye,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import { EditCampaignDialog } from "./EditCampaignDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { NotificationCenter } from "./NotificationCenter";
import { AuthApiService } from "../services/authservice";

interface Campaign {
  id: number;
  title: string;
  description: string;
  tags: string[];
  organization: string;
  type?: string;
  location?: string;
  disabilities?: string[];
  status?: 'active' | 'draft' | 'closed';
  applicants?: number;
  views?: number;
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

// Función para obtener rol por ID como fallback
const getRoleFromId = (roleId: number | undefined): 'postulante' | 'organismo' | 'tutor' => {
  if (!roleId) return 'postulante';
  
  // Mapeo de IDs según tu seed (ajustar según tu base de datos)
  switch(roleId) {
    case 1: // Administrador
      return 'organismo';
    case 2: // Tutor
      return 'tutor';
    case 3: // Voluntario
      return 'postulante';
    case 4: // Organización
      return 'organismo';
    default:
      console.warn(`ID de rol desconocido: ${roleId}, usando postulante por defecto`);
      return 'postulante';
  }
};

// Función para determinar rol con múltiples estrategias
const determineUserRole = (
  roleName: string | undefined, 
  roleId: number | undefined,
  userProfile: any
): 'postulante' | 'organismo' | 'tutor' => {
  
  
  // Estrategia 1: Usar roleName del backend
  if (roleName) {
    const normalized = roleName.toLowerCase();
    if (normalized.includes('voluntario')) return 'postulante';
    if (normalized.includes('tutor')) return 'tutor';
    if (normalized.includes('organización') || normalized.includes('organismo')) return 'organismo';
    if (normalized.includes('administrador')) return 'organismo';
  }
  
  // Estrategia 2: Usar userProfile si está disponible
  if (userProfile?.rol?.NombreRol) {
    const normalized = userProfile.rol.NombreRol.toLowerCase();
    if (normalized.includes('voluntario')) return 'postulante';
    if (normalized.includes('tutor')) return 'tutor';
    if (normalized.includes('organización')) return 'organismo';
    if (normalized.includes('administrador')) return 'organismo';
  }
  
  // Estrategia 3: Usar ID del rol como último recurso
  return getRoleFromId(roleId);
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterDisability, setFilterDisability] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<"inicio" | "postulaciones" | "favoritos" | "configuracion">("inicio");

  // Campaign interaction states
  const [likedCampaigns, setLikedCampaigns] = useState<Set<number>>(new Set());
  const [followedCampaigns, setFollowedCampaigns] = useState<Set<number>>(new Set());
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<number>>(new Set());

  // Edit/Delete states
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: "Desarrollador Web Inclusivo",
      description: "Oportunidad de empleo inclusivo para desarrolladores con cualquier capacidad.",
      tags: ["Empleo", "Tecnología"],
      organization: "TechForAll",
      type: "empleo",
      location: "Ciudad de México, CDMX",
      disabilities: ["todas"],
      status: "active",
      applicants: 15,
      views: 120,
    },
    {
      id: 2,
      title: "Programa de Servicio Social Educativo",
      description: "Apoyo educativo en comunidades marginadas. Cumple tu servicio social con impacto.",
      tags: ["Servicio social", "Educación"],
      organization: "Fundación Educativa",
      type: "servicio-social",
      location: "Guadalajara, Jalisco",
      disabilities: ["todas"],
      status: "active",
      applicants: 8,
      views: 95,
    },
    {
      id: 3,
      title: "Voluntariado Comunitario",
      description: "Participa en iniciativas que fortalecen la comunidad y generan impacto positivo.",
      tags: ["Comunitario", "Voluntariado"],
      organization: "Comunidad Activa",
      type: "voluntariado",
      location: "Monterrey, Nuevo León",
      disabilities: ["motriz", "visual"],
      status: "active",
      applicants: 22,
      views: 180,
    },
    {
      id: 4,
      title: "Asistente Administrativo",
      description: "Posición administrativa con adaptaciones para personas con discapacidad auditiva.",
      tags: ["Empleo", "Administrativo"],
      organization: "Corporativo Inclusivo",
      type: "empleo",
      location: "Remoto",
      disabilities: ["auditiva"],
      status: "active",
      applicants: 12,
      views: 145,
    },
  ]);

  // Cargar perfil del usuario si no tiene roleName
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.userId && !user.roleName) {
        try {
          const profile = await AuthApiService.getProfile(user.userId);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error cargando perfil:', error);
        }
      }
    };
    
    if (!authLoading && user) {
      loadUserProfile();
      setIsLoading(false);
    } else if (!authLoading && !user) {
      setIsLoading(false);
      onNavigate('landing');
    }
  }, [authLoading, user, onNavigate]);

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A4E6A]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = determineUserRole(user.roleName, user.userRole, userProfile);
  const userName = user.userName || userProfile?.Nombre || 'Usuario';

  const handleCreateCampaign = (newCampaign: any) => {
    const campaign: Campaign = {
      id: campaigns.length + 1,
      title: newCampaign.title,
      description: newCampaign.description,
      tags: [newCampaign.type, newCampaign.location],
      organization: newCampaign.organization,
      type: newCampaign.type,
      location: newCampaign.location,
      disabilities: newCampaign.disabilities,
      status: 'active',
      applicants: 0,
      views: 0,
    };
    setCampaigns([campaign, ...campaigns]);
    toast.success("¡Campaña creada y publicada exitosamente!");
  };

  const handleEditCampaign = (editedCampaign: Campaign) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === editedCampaign.id ? editedCampaign : c,
      ),
    );
    toast.success("Campaña actualizada exitosamente");
  };

  const handleDeleteCampaign = () => {
    if (campaignToDelete !== null) {
      setCampaigns(
        campaigns.filter((c) => c.id !== campaignToDelete),
      );
      toast.success("Campaña eliminada exitosamente");
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleLike = (campaignId: number) => {
    setLikedCampaigns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
        toast.info("Campaña removida de favoritos");
      } else {
        newSet.add(campaignId);
        toast.success("Campaña agregada a favoritos");
      }
      return newSet;
    });
  };

  const handleFollow = (campaignId: number) => {
    setFollowedCampaigns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
        toast.info("Has dejado de seguir esta campaña");
      } else {
        newSet.add(campaignId);
        toast.success("Ahora sigues esta campaña y recibirás actualizaciones");
      }
      return newSet;
    });
  };

  const handleApply = (campaignId: number) => {
    if (!appliedCampaigns.has(campaignId)) {
      setAppliedCampaigns((prev) => new Set(prev).add(campaignId));
      // Incrementar contador de postulantes
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, applicants: (c.applicants || 0) + 1 } : c
      ));
      toast.success("¡Postulación enviada exitosamente!");
    } else {
      toast.info("Ya te has postulado a esta campaña");
    }
  };

  // Manejar clic en notificación
  const handleNotificationClick = (notification: any) => {
    
    if (notification.IDCampania) {
      toast.info(`Navegando a campaña: ${notification.campania?.Nombre || notification.IDCampania}`);
    }

    switch (notification.Tipo) {
      case 'certificado_emitido':
        toast.success('Puedes descargar tu certificado desde tu perfil');
        break;
      case 'postulacion_aceptada':
        toast.success('¡Felicitaciones! Revisa los detalles en tus postulaciones');
        break;
      case 'campania_actualizada':
        toast.info('Revisa los cambios en la campaña');
        break;
      default:
        break;
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (campaignId: number) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" || campaign.type === filterType;
    const matchesLocation =
      filterLocation === "all" ||
      campaign.location?.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesDisability =
      filterDisability === "all" ||
      campaign.disabilities?.includes(filterDisability) ||
      campaign.disabilities?.includes("todas");

    return matchesSearch && matchesType && matchesLocation && matchesDisability;
  });

  const favoriteCampaigns = campaigns.filter((c) => likedCampaigns.has(c.id));
  const appliedCampaignsList = campaigns.filter((c) => appliedCampaigns.has(c.id));
  const followedCampaignsList = campaigns.filter((c) => followedCampaigns.has(c.id));

  // Renderizado de contenido según vista de menú lateral
  const renderMainContent = () => {
    if (currentView === "postulaciones") {
      return (
        <div className="space-y-6">
          <h2 className="text-[#0A4E6A]">Mis Postulaciones</h2>
          {appliedCampaignsList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No tienes postulaciones activas</p>
                <Button
                  className="mt-4 bg-[#E86C4B] hover:bg-[#d45a39] text-white"
                  onClick={() => setCurrentView("inicio")}
                >
                  Explorar oportunidades
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appliedCampaignsList.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#0A4E6A]">{campaign.title}</CardTitle>
                        <CardDescription className="mt-1">{campaign.organization}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Postulado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#F5D27A] text-[#1F1F1F]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentView === "favoritos") {
      return (
        <div className="space-y-6">
          <h2 className="text-[#0A4E6A]">Mis Favoritos</h2>
          {favoriteCampaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No tienes campañas favoritas</p>
                <Button
                  className="mt-4 bg-[#E86C4B] hover:bg-[#d45a39] text-white"
                  onClick={() => setCurrentView("inicio")}
                >
                  Explorar oportunidades
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {favoriteCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#0A4E6A]">{campaign.title}</CardTitle>
                        <CardDescription className="mt-1">{campaign.organization}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLike(campaign.id)}
                      >
                        <Heart className="w-5 h-5 fill-[#E86C4B] text-[#E86C4B]" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {campaign.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#F5D27A] text-[#1F1F1F]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className={`${
                        appliedCampaigns.has(campaign.id)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[#E86C4B] hover:bg-[#d45a39]"
                      } text-white`}
                      onClick={() => handleApply(campaign.id)}
                      disabled={appliedCampaigns.has(campaign.id)}
                    >
                      {appliedCampaigns.has(campaign.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Postulado
                        </>
                      ) : (
                        "Postularse"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentView === "configuracion") {
      return (
        <div className="space-y-6">
          <h2 className="text-[#0A4E6A]">Configuración</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0A4E6A]">Preferencias de cuenta</CardTitle>
              <CardDescription>Gestiona tu cuenta y preferencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm mb-2">Notificaciones por correo</p>
                <Button variant="outline">Configurar</Button>
              </div>
              <div>
                <p className="text-sm mb-2">Privacidad y seguridad</p>
                <Button variant="outline">Administrar</Button>
              </div>
              <div>
                <p className="text-sm mb-2">Preferencias de accesibilidad</p>
                <Button variant="outline">Personalizar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Vista principal según el rol
    if (userRole === "organismo") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#0A4E6A]">Panel de Organismo</h2>
              <p className="text-gray-600">Gestiona tus campañas y visualiza estadísticas</p>
            </div>
            <CreateCampaignDialog onCreateCampaign={handleCreateCampaign} />
          </div>

          {/* Estadísticas */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Campañas Activas</p>
                    <h3 className="text-[#0A4E6A] mt-1">{campaigns.filter(c => c.status === 'active').length}</h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#E86C4B]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Postulantes</p>
                    <h3 className="text-[#0A4E6A] mt-1">{campaigns.reduce((acc, c) => acc + (c.applicants || 0), 0)}</h3>
                  </div>
                  <Users className="w-8 h-8 text-[#E86C4B]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Vistas</p>
                    <h3 className="text-[#0A4E6A] mt-1">{campaigns.reduce((acc, c) => acc + (c.views || 0), 0)}</h3>
                  </div>
                  <Eye className="w-8 h-8 text-[#E86C4B]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Promedio postulantes</p>
                    <h3 className="text-[#0A4E6A] mt-1">
                      {campaigns.length > 0 
                        ? Math.round(campaigns.reduce((acc, c) => acc + (c.applicants || 0), 0) / campaigns.length)
                        : 0}
                    </h3>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#E86C4B]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mis Campañas */}
          <div>
            <h3 className="text-[#0A4E6A] mb-4">Mis Campañas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#0A4E6A]">{campaign.title}</CardTitle>
                        <CardDescription>{campaign.organization}</CardDescription>
                      </div>
                      <Badge className={campaign.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {campaign.status === 'active' ? 'Activa' : 'Borrador'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                    
                    {/* Estadísticas de la campaña */}
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Postulantes</p>
                        <p className="text-[#0A4E6A]">{campaign.applicants || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Vistas</p>
                        <p className="text-[#0A4E6A]">{campaign.views || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Tasa</p>
                        <p className="text-[#0A4E6A]">
                          {campaign.views ? Math.round(((campaign.applicants || 0) / campaign.views) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-[#F5D27A] text-[#1F1F1F]">
                        {campaign.location}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(campaign)}
                          className="hover:bg-[#0A4E6A] hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => openDeleteDialog(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (userRole === "tutor") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-[#0A4E6A]">Panel de Tutor</h2>
            <p className="text-gray-600">Acompaña y da seguimiento a las campañas</p>
          </div>

          {/* Campañas que sigo */}
          <div>
            <h3 className="text-[#0A4E6A] mb-4">Campañas en Seguimiento</h3>
            {followedCampaignsList.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No estás siguiendo ninguna campaña</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Explora las campañas disponibles y comienza a dar seguimiento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {followedCampaignsList.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-[#0A4E6A]">{campaign.title}</CardTitle>
                          <CardDescription>{campaign.organization}</CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Eye className="w-3 h-3 mr-1" />
                          Siguiendo
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                      
                      {/* Info de seguimiento */}
                      <div className="p-3 bg-blue-50 rounded-lg mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>{campaign.applicants || 0}</strong> postulantes activos
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-[#0A4E6A] text-[#0A4E6A]"
                        >
                          Ver detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(campaign.id)}
                          className="text-gray-600"
                        >
                          Dejar de seguir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Todas las campañas disponibles */}
          <div>
            <h3 className="text-[#0A4E6A] mb-4">Campañas Disponibles</h3>
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#0A4E6A]">{campaign.title}</CardTitle>
                        <CardDescription className="mt-1">{campaign.organization}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {campaign.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#F5D27A] text-[#1F1F1F]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className={`${
                        followedCampaigns.has(campaign.id)
                          ? "border-green-600 text-green-600 bg-green-50"
                          : "border-[#0A4E6A] text-[#0A4E6A]"
                      }`}
                      onClick={() => handleFollow(campaign.id)}
                    >
                      {followedCampaigns.has(campaign.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Siguiendo
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Dar seguimiento
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Vista de Postulante (por defecto)
    return (
      <div className="space-y-6">
        <h2 className="text-[#0A4E6A]">Oportunidades Disponibles</h2>
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-[#0A4E6A]">{campaign.title}</CardTitle>
                    <CardDescription className="mt-1">{campaign.organization}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleLike(campaign.id)}>
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likedCampaigns.has(campaign.id)
                          ? "fill-[#E86C4B] text-[#E86C4B]"
                          : "text-gray-400 hover:text-[#E86C4B]"
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{campaign.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#F5D27A] text-[#1F1F1F]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    className={`${
                      appliedCampaigns.has(campaign.id)
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-[#E86C4B] hover:bg-[#d45a39]"
                    } text-white`}
                    onClick={() => handleApply(campaign.id)}
                    disabled={appliedCampaigns.has(campaign.id)}
                  >
                    {appliedCampaigns.has(campaign.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Postulado
                      </>
                    ) : (
                      "Postularse"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className={`${
                      followedCampaigns.has(campaign.id)
                        ? "border-green-600 text-green-600 bg-green-50"
                        : "border-[#0A4E6A] text-[#0A4E6A]"
                    }`}
                    onClick={() => handleFollow(campaign.id)}
                  >
                    {followedCampaigns.has(campaign.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Seguir
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Función para mostrar el nombre del rol en el badge
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'postulante':
        return 'Postulante/Voluntario';
      case 'organismo':
        return 'Organismo';
      case 'tutor':
        return 'Tutor';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFA]">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6 text-[#0A4E6A]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="space-y-4 mt-8">
                    <div className="pb-4 border-b">
                      <p className="text-sm text-gray-600">Bienvenido</p>
                      <p className="text-[#0A4E6A]">{userName}</p>
                      <Badge className="mt-2 bg-[#E86C4B] text-white">
                        {getRoleDisplayName()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("inicio")}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Inicio
                      </Button>
                      {userRole === "postulante" && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setCurrentView("postulaciones")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Mis Postulaciones
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("favoritos")}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Favoritos
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => onNavigate("profile")}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("configuracion")}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configuración
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600"
                        onClick={() => onNavigate("landing")}
                      >
                        Cerrar sesión
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <h2 className="text-[#0A4E6A] cursor-pointer" onClick={() => onNavigate("landing")}>
                Talento sin Barreras
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Componente de Notificaciones */}
              <NotificationCenter 
                userId={user.userId}
                onNotificationClick={handleNotificationClick}
              />
              <Button variant="ghost" size="icon" onClick={() => onNavigate("profile")}>
                <User className="w-5 h-5 text-[#0A4E6A]" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar - Solo visible en vista inicio */}
        {currentView === "inicio" && (
          <div className="mb-8">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar campañas, oportunidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 border-gray-300"
                />
              </div>

              {/* Advanced Filters */}
              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <div className="flex justify-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      {showFilters ? "Ocultar Filtros" : "Filtros Avanzados"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-4">
                  <div className="grid md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <label className="text-sm">Tipo de Oportunidad</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="empleo">Empleo</SelectItem>
                          <SelectItem value="servicio-social">Servicio Social</SelectItem>
                          <SelectItem value="voluntariado">Voluntariado</SelectItem>
                          <SelectItem value="practicas">Prácticas Profesionales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm">Ubicación</label>
                      <Select value={filterLocation} onValueChange={setFilterLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="remoto">Remoto</SelectItem>
                          <SelectItem value="ciudad de méxico">Ciudad de México</SelectItem>
                          <SelectItem value="guadalajara">Guadalajara</SelectItem>
                          <SelectItem value="monterrey">Monterrey</SelectItem>
                          <SelectItem value="puebla">Puebla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm">Adaptaciones</label>
                      <Select value={filterDisability} onValueChange={setFilterDisability}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="auditiva">Auditiva</SelectItem>
                          <SelectItem value="motriz">Motriz</SelectItem>
                          <SelectItem value="cognitiva">Cognitiva</SelectItem>
                          <SelectItem value="todas">Sin restricciones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {/* Contenido principal según vista */}
        {renderMainContent()}
      </div>

      {/* Edit Campaign Dialog */}
      <EditCampaignDialog
        campaign={editingCampaign}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEditCampaign={handleEditCampaign}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La campaña será eliminada permanentemente y no estará
              disponible para los postulantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
