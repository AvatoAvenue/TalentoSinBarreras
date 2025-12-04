import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
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
import { NotificationCenter } from "./NotificationCenter";
import { useAuth } from "../contexts/AuthContext";

interface Campaign {
  id: number;
  title: string;
  description: string;
  tags: string[];
  organization: string;
  type?: string;
  location?: string;
  disabilities?: string[];
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
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
      description:
        "Oportunidad de empleo inclusivo para desarrolladores con cualquier capacidad.",
      tags: ["Empleo", "Tecnología"],
      organization: "TechForAll",
      type: "empleo",
      location: "Ciudad de México, CDMX",
      disabilities: ["todas"],
    },
    {
      id: 2,
      title: "Programa de Servicio Social Educativo",
      description:
        "Apoyo educativo en comunidades marginadas. Cumple tu servicio social con impacto.",
      tags: ["Servicio social", "Educación"],
      organization: "Fundación Educativa",
      type: "servicio-social",
      location: "Guadalajara, Jalisco",
      disabilities: ["todas"],
    },
    {
      id: 3,
      title: "Voluntariado Comunitario",
      description:
        "Participa en iniciativas que fortalecen la comunidad y generan impacto positivo.",
      tags: ["Comunitario", "Voluntariado"],
      organization: "Comunidad Activa",
      type: "voluntariado",
      location: "Monterrey, Nuevo León",
      disabilities: ["motriz", "visual"],
    },
    {
      id: 4,
      title: "Asistente Administrativo",
      description:
        "Posición administrativa con adaptaciones para personas con discapacidad auditiva.",
      tags: ["Empleo", "Administrativo"],
      organization: "Corporativo Inclusivo",
      type: "empleo",
      location: "Remoto",
      disabilities: ["auditiva"],
    },
  ]);

  // Efecto para manejar la autenticación
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('No hay usuario, redirigiendo al login');
        onNavigate('landing');
      } else if (!user.userId || isNaN(user.userId)) {
        console.error('Usuario sin userId válido:', user);
        toast.error("Error en los datos del usuario");
      }
      setIsLoading(false);
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
    };
    setCampaigns([campaign, ...campaigns]);
    toast.success("¡Campaña creada exitosamente!");
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
        toast.success("Ahora sigues esta campaña");
      }
      return newSet;
    });
  };

  const handleApply = (campaignId: number) => {
    if (!appliedCampaigns.has(campaignId)) {
      setAppliedCampaigns((prev) =>
        new Set(prev).add(campaignId),
      );
      toast.success("¡Postulación enviada exitosamente!");
    } else {
      toast.info("Ya te has postulado a esta campaña");
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

  // Manejar clic en notificación
  const handleNotificationClick = (notification: any) => {
    console.log('Notificación clickeada:', notification);
    
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

  const filteredCampaigns = campaigns.filter((campaign) => {
    // Text search
    const matchesSearch =
      campaign.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      campaign.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      campaign.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    // Type filter
    const matchesType =
      filterType === "all" || campaign.type === filterType;

    // Location filter
    const matchesLocation =
      filterLocation === "all" ||
      campaign.location
        ?.toLowerCase()
        .includes(filterLocation.toLowerCase());

    // Disability filter
    const matchesDisability =
      filterDisability === "all" ||
      campaign.disabilities?.includes(filterDisability) ||
      campaign.disabilities?.includes("todas");

    return (
      matchesSearch &&
      matchesType &&
      matchesLocation &&
      matchesDisability
    );
  });

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
                    <h3 className="text-[#0A4E6A]">Menú</h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("inicio")}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Inicio
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("postulaciones")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Mis Postulaciones
                      </Button>
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
              <h2
                className="text-[#0A4E6A] cursor-pointer"
                onClick={() => onNavigate("landing")}
              >
                Talento sin Barreras
              </h2>
            </div>
            <div className="flex items-center gap-2">
              
              {/* Componente de Notificaciones */}
              <NotificationCenter 
                userId={user.userId}
                onNotificationClick={handleNotificationClick}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("profile")}
              >
                <User className="w-5 h-5 text-[#0A4E6A]" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
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

            {/* Filtros */}
            <Collapsible
              open={showFilters}
              onOpenChange={setShowFilters}
            >
              <div className="flex justify-center">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {showFilters
                      ? "Ocultar Filtros"
                      : "Filtros Avanzados"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-4">
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <label className="text-sm">
                      Tipo de Oportunidad
                    </label>
                    <Select
                      value={filterType}
                      onValueChange={setFilterType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
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
                    <label className="text-sm">Ubicación</label>
                    <Select
                      value={filterLocation}
                      onValueChange={setFilterLocation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="remoto">Remoto</SelectItem>
                        <SelectItem value="ciudad de méxico">
                          Ciudad de México
                        </SelectItem>
                        <SelectItem value="guadalajara">
                          Guadalajara
                        </SelectItem>
                        <SelectItem value="monterrey">
                          Monterrey
                        </SelectItem>
                        <SelectItem value="puebla">Puebla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Adaptaciones</label>
                    <Select
                      value={filterDisability}
                      onValueChange={setFilterDisability}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="auditiva">Auditiva</SelectItem>
                        <SelectItem value="motriz">Motriz</SelectItem>
                        <SelectItem value="cognitiva">Cognitiva</SelectItem>
                        <SelectItem value="todas">
                          Sin restricciones
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="postulante">Postulante</TabsTrigger>
            <TabsTrigger value="organismo">Organismo</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid md:grid-cols-1 gap-6">
              <div className="space-y-6">
                <h2 className="text-[#0A4E6A]">
                  Campañas Activas
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCampaigns.map((campaign) => (
                    <Card
                      key={campaign.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-[#0A4E6A]">
                              {campaign.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {campaign.organization}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleLike(campaign.id)
                            }
                          >
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
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {campaign.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {campaign.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-[#F5D27A] text-[#1F1F1F]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className={`flex-1 ${
                              appliedCampaigns.has(campaign.id)
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-[#E86C4B] hover:bg-[#d45a39]"
                            } text-white`}
                            onClick={() =>
                              handleApply(campaign.id)
                            }
                            disabled={appliedCampaigns.has(
                              campaign.id,
                            )}
                          >
                            {appliedCampaigns.has(
                              campaign.id,
                            ) ? (
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
                            size="icon"
                            className={`${
                              followedCampaigns.has(campaign.id)
                                ? "border-green-600 text-green-600 bg-green-50"
                                : "border-[#0A4E6A] text-[#0A4E6A]"
                            }`}
                            onClick={() =>
                              handleFollow(campaign.id)
                            }
                          >
                            {followedCampaigns.has(
                              campaign.id,
                            ) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="postulante">
            <div className="text-center py-12">
              <h3 className="text-[#0A4E6A] mb-4">
                Vista de Postulante
              </h3>
              <p className="text-gray-600">
                Aquí verás las oportunidades disponibles para ti
                como postulante.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="organismo">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#0A4E6A]">
                    Mis Campañas
                  </h3>
                  <p className="text-gray-600">
                    Gestiona y crea nuevas campañas para tu
                    organización
                  </p>
                </div>
                <CreateCampaignDialog
                  onCreateCampaign={handleCreateCampaign}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {campaigns.slice(0, 4).map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-[#0A4E6A]">
                        {campaign.title}
                      </CardTitle>
                      <CardDescription>
                        {campaign.organization}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">
                        {campaign.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-[#F5D27A] text-[#1F1F1F]"
                          >
                            {campaign.location}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openEditDialog(campaign)
                            }
                            className="hover:bg-[#0A4E6A] hover:text-white"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-600 hover:text-white"
                            onClick={() =>
                              openDeleteDialog(campaign.id)
                            }
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Campaign Dialog */}
      <EditCampaignDialog
        campaign={editingCampaign}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEditCampaign={handleEditCampaign}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar campaña?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La campaña será
              eliminada permanentemente y no estará disponible
              para los postulantes.
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
