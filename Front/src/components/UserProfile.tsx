import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Camera, Save, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("personal");
  
  const [profileData, setProfileData] = useState({
    // Datos básicos de usuario
    nombre: "",
    telefono: "",
    biografia: "",
    email: "",
    
    // Datos de voluntario
    voluntarioNombre: "",
    fechaNacimiento: "",
    institucionEducativa: "",
    tipoDiscapacidad: "ninguna",
    adaptacionesRequeridas: "",
    habilidades: "",
    horasAcumuladas: 0,
    
    // Datos de tutor
    tutorNombre: "",
    tutorFechaNacimiento: "",
    parentesco: "",
    tutorTelefono: "",
    direccionCompleta: "",
    
    // Datos de organización
    nombreOrganizacion: "",
    tipoOrganizacion: "",
    categoriaPrincipal: "",
    responsable: "",
    orgTelefono: "",
    descripcion: "",
    sitioWeb: "",
  });

  // Función para obtener el userId de forma segura
  const getUserId = (): number | null => {
    // 1. Primero intenta usar authUser del contexto
    if (authUser?.IDUsuario) {
      const userId = Number(authUser.IDUsuario);
      return !isNaN(userId) ? userId : null;
    }
    
    // 2. Si no, intenta obtenerlo del localStorage como fallback
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Buscar ID en diferentes propiedades posibles
        const userId = Number(user.IDUsuario || user.userId || user.id);
        return !isNaN(userId) ? userId : null;
      }
    } catch (error) {
      console.error("Error al obtener userId del localStorage:", error);
    }
    
    return null;
  };

  useEffect(() => {
    const userId = getUserId();
    console.log("UserProfile - userId obtenido:", userId);
    
    if (!userId) {
      toast.error("No se encontró información de usuario. Por favor, inicie sesión.");
      onNavigate('login');
      return;
    }
    
    loadProfile(userId);
  }, []);

  const loadProfile = async (userId: number) => {
    setLoading(true);
    try {
      console.log("Cargando perfil para ID:", userId);
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (data.success && data.data) {
        const userData = data.data;
        setUserData(userData);
        
        // Cargar datos básicos
        setProfileData(prev => ({
          ...prev,
          nombre: userData.Nombre || "",
          telefono: userData.Telefono || "",
          biografia: userData.Biografia || "",
          email: userData.CorreoElectronico || "",
          
          // Cargar datos de voluntario si existe
          voluntarioNombre: userData.voluntario?.Nombre || "",
          fechaNacimiento: userData.voluntario?.FechaNacimiento 
            ? new Date(userData.voluntario.FechaNacimiento).toISOString().split('T')[0] 
            : "",
          institucionEducativa: userData.voluntario?.InstitucionEducativa || "",
          tipoDiscapacidad: userData.voluntario?.TipoDiscapacidad || "ninguna",
          adaptacionesRequeridas: userData.voluntario?.AdaptacionesRequeridas || "",
          habilidades: userData.voluntario?.Habilidades || "",
          horasAcumuladas: userData.voluntario?.HorasAcumuladas || 0,
          
          // Cargar datos de tutor si existe
          tutorNombre: userData.tutor?.Nombre || "",
          tutorFechaNacimiento: userData.tutor?.FechaNacimiento 
            ? new Date(userData.tutor.FechaNacimiento).toISOString().split('T')[0] 
            : "",
          parentesco: userData.tutor?.Parentesco || "",
          tutorTelefono: userData.tutor?.Telefono || "",
          direccionCompleta: userData.tutor?.DireccionCompleta || "",
          
          // Cargar datos de organización si existe
          nombreOrganizacion: userData.organizaciones?.[0]?.NombreOrganizacion || "",
          tipoOrganizacion: userData.organizaciones?.[0]?.TipoOrganizacion || "",
          categoriaPrincipal: userData.organizaciones?.[0]?.CategoriaPrincipal || "",
          responsable: userData.organizaciones?.[0]?.Responsable || "",
          orgTelefono: userData.organizaciones?.[0]?.Telefono || "",
          descripcion: userData.organizaciones?.[0]?.Descripcion || "",
          sitioWeb: userData.organizaciones?.[0]?.SitioWeb || "",
        }));
      } else {
        toast.error(data.message || "Error al cargar el perfil");
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error de conexión al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error("No hay usuario autenticado");
      return;
    }
    
    setSaving(true);
    try {
      // Actualizar datos básicos de usuario
      const basicResponse = await fetch(`${API_BASE_URL}/profile/${userId}/basic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: profileData.nombre,
          telefono: profileData.telefono,
          biografia: profileData.biografia
        })
      });
      
      const basicResult = await basicResponse.json();
      if (!basicResult.success) {
        throw new Error(basicResult.message || "Error al actualizar datos básicos");
      }

      // Actualizar según el rol
      if (userData?.voluntario) {
        const voluntarioResponse = await fetch(`${API_BASE_URL}/profile/${userId}/voluntario`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: profileData.voluntarioNombre,
            fechaNacimiento: profileData.fechaNacimiento,
            institucionEducativa: profileData.institucionEducativa,
            tipoDiscapacidad: profileData.tipoDiscapacidad,
            adaptacionesRequeridas: profileData.adaptacionesRequeridas,
            habilidades: profileData.habilidades
          })
        });
        
        const voluntarioResult = await voluntarioResponse.json();
        if (!voluntarioResult.success) {
          throw new Error(voluntarioResult.message || "Error al actualizar datos de voluntario");
        }
      }

      if (userData?.tutor) {
        const tutorResponse = await fetch(`${API_BASE_URL}/profile/${userId}/tutor`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: profileData.tutorNombre,
            fechaNacimiento: profileData.tutorFechaNacimiento,
            parentesco: profileData.parentesco,
            telefono: profileData.tutorTelefono,
            direccionCompleta: profileData.direccionCompleta
          })
        });
        
        const tutorResult = await tutorResponse.json();
        if (!tutorResult.success) {
          throw new Error(tutorResult.message || "Error al actualizar datos de tutor");
        }
      }

      if (userData?.organizaciones?.[0]) {
        const organizacionResponse = await fetch(`${API_BASE_URL}/profile/${userId}/organizacion`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreOrganizacion: profileData.nombreOrganizacion,
            tipoOrganizacion: profileData.tipoOrganizacion,
            categoriaPrincipal: profileData.categoriaPrincipal,
            responsable: profileData.responsable,
            telefono: profileData.orgTelefono,
            descripcion: profileData.descripcion,
            sitioWeb: profileData.sitioWeb
          })
        });
        
        const organizacionResult = await organizacionResponse.json();
        if (!organizacionResult.success) {
          throw new Error(organizacionResult.message || "Error al actualizar datos de organización");
        }
      }

      toast.success("Perfil actualizado exitosamente");
      setIsEditing(false);
      await loadProfile(userId);
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      toast.error(error.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5FAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A4E6A]" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#F5FAFA] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No se pudo cargar el perfil</p>
            <Button 
              onClick={() => onNavigate('dashboard')} 
              className="w-full mt-4"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (profileData.nombre || "Usuario")
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getRoleName = () => {
    if (userData.voluntario) return "Voluntario";
    if (userData.tutor) return "Tutor";
    if (userData.organizaciones?.length > 0) return "Organización";
    return "Usuario";
  };

  return (
    <div className="min-h-screen bg-[#F5FAFA]">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#0A4E6A]" />
            </button>
            <h1 className="text-[#0A4E6A]">Mi Perfil</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="" alt={profileData.nombre} />
                  <AvatarFallback className="bg-[#0A4E6A] text-white text-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button 
                    className="absolute bottom-0 right-0 p-2 bg-[#E86C4B] rounded-full text-white hover:bg-[#d45a39] transition-colors"
                    onClick={() => toast.info("Función de cambio de foto próximamente")}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-[#0A4E6A] mb-1">{profileData.nombre || "Usuario"}</h2>
                <p className="text-gray-600 mb-2">{profileData.email}</p>
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-gray-500">
                    <strong>Rol:</strong> {getRoleName()}
                  </p>
                  {profileData.telefono && (
                    <p className="text-gray-500">
                      <strong>Teléfono:</strong> {profileData.telefono}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#E86C4B] hover:bg-[#d45a39] text-white"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        const userId = getUserId();
                        if (userId) loadProfile(userId);
                      }}
                      disabled={saving}
                      className="border-gray-300"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#E86C4B] hover:bg-[#d45a39] text-white"
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-2">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A4E6A]">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Datos básicos de usuario */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#0A4E6A]">Datos Generales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo *</Label>
                      <Input
                        id="nombre"
                        value={profileData.nombre}
                        onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={profileData.telefono}
                        onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+52 555 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">El correo no puede ser modificado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biografia">Biografía</Label>
                    <Textarea
                      id="biografia"
                      value={profileData.biografia}
                      onChange={(e) => setProfileData({ ...profileData, biografia: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Cuéntanos un poco sobre ti..."
                    />
                  </div>
                </div>

                {/* Datos específicos de VOLUNTARIO */}
                {userData?.voluntario && (
                  <>
                    <hr className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-[#0A4E6A]">Información de Voluntario</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="voluntarioNombre">Nombre del Voluntario *</Label>
                          <Input
                            id="voluntarioNombre"
                            value={profileData.voluntarioNombre}
                            onChange={(e) => setProfileData({ ...profileData, voluntarioNombre: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                          <Input
                            id="fechaNacimiento"
                            type="date"
                            value={profileData.fechaNacimiento}
                            onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="institucionEducativa">Institución Educativa</Label>
                          <Input
                            id="institucionEducativa"
                            value={profileData.institucionEducativa}
                            onChange={(e) => setProfileData({ ...profileData, institucionEducativa: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Universidad, Colegio, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipoDiscapacidad">Tipo de Discapacidad</Label>
                          <Select
                            value={profileData.tipoDiscapacidad}
                            onValueChange={(value) => setProfileData({ ...profileData, tipoDiscapacidad: value })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ninguna">Ninguna</SelectItem>
                              <SelectItem value="visual">Visual</SelectItem>
                              <SelectItem value="auditiva">Auditiva</SelectItem>
                              <SelectItem value="motriz">Motriz</SelectItem>
                              <SelectItem value="cognitiva">Cognitiva</SelectItem>
                              <SelectItem value="multiple">Múltiple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adaptacionesRequeridas">Adaptaciones Requeridas</Label>
                        <Textarea
                          id="adaptacionesRequeridas"
                          value={profileData.adaptacionesRequeridas}
                          onChange={(e) => setProfileData({ ...profileData, adaptacionesRequeridas: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                          placeholder="Describe las adaptaciones que necesitas en tu entorno (ej: acceso en silla de ruedas, lector de pantalla, etc.)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="habilidades">Habilidades</Label>
                        <Textarea
                          id="habilidades"
                          value={profileData.habilidades}
                          onChange={(e) => setProfileData({ ...profileData, habilidades: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                          placeholder="Lista tus habilidades (ej: programación, diseño gráfico, trabajo en equipo, etc.)"
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-[#0A4E6A]">
                          🏆 Horas Acumuladas: <span className="text-lg">{profileData.horasAcumuladas}</span> horas
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Datos específicos de TUTOR */}
                {userData?.tutor && (
                  <>
                    <hr className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-[#0A4E6A]">Información de Tutor</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tutorNombre">Nombre del Tutor</Label>
                          <Input
                            id="tutorNombre"
                            value={profileData.tutorNombre}
                            onChange={(e) => setProfileData({ ...profileData, tutorNombre: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tutorFechaNacimiento">Fecha de Nacimiento</Label>
                          <Input
                            id="tutorFechaNacimiento"
                            type="date"
                            value={profileData.tutorFechaNacimiento}
                            onChange={(e) => setProfileData({ ...profileData, tutorFechaNacimiento: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parentesco">Parentesco</Label>
                          <Input
                            id="parentesco"
                            value={profileData.parentesco}
                            onChange={(e) => setProfileData({ ...profileData, parentesco: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ej: Padre, Madre, Tutor Legal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tutorTelefono">Teléfono de Contacto</Label>
                          <Input
                            id="tutorTelefono"
                            value={profileData.tutorTelefono}
                            onChange={(e) => setProfileData({ ...profileData, tutorTelefono: e.target.value })}
                            disabled={!isEditing}
                            placeholder="+52 555 123 4567"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="direccionCompleta">Dirección Completa</Label>
                        <Textarea
                          id="direccionCompleta"
                          value={profileData.direccionCompleta}
                          onChange={(e) => setProfileData({ ...profileData, direccionCompleta: e.target.value })}
                          disabled={!isEditing}
                          rows={2}
                          placeholder="Calle, Número, Colonia, Ciudad, Estado, CP"
                        />
                      </div>

                      {userData.tutor.voluntariosTutorados?.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-green-700 mb-2">
                            👥 Voluntarios Tutorados:
                          </p>
                          {userData.tutor.voluntariosTutorados.map((vol: any) => (
                            <p key={vol.IDVoluntario} className="text-sm text-gray-700">
                              • {vol.Nombre}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Datos específicos de ORGANIZACIÓN */}
                {userData?.organizaciones?.[0] && (
                  <>
                    <hr className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-[#0A4E6A]">Información de Organización</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombreOrganizacion">Nombre de la Organización *</Label>
                          <Input
                            id="nombreOrganizacion"
                            value={profileData.nombreOrganizacion}
                            onChange={(e) => setProfileData({ ...profileData, nombreOrganizacion: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipoOrganizacion">Tipo de Organización</Label>
                          <Input
                            id="tipoOrganizacion"
                            value={profileData.tipoOrganizacion}
                            onChange={(e) => setProfileData({ ...profileData, tipoOrganizacion: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ej: ONG, Fundación, Asociación Civil"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoriaPrincipal">Categoría Principal</Label>
                          <Input
                            id="categoriaPrincipal"
                            value={profileData.categoriaPrincipal}
                            onChange={(e) => setProfileData({ ...profileData, categoriaPrincipal: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Ej: Educación, Salud, Medio Ambiente"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="responsable">Responsable</Label>
                          <Input
                            id="responsable"
                            value={profileData.responsable}
                            onChange={(e) => setProfileData({ ...profileData, responsable: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Nombre del responsable"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orgTelefono">Teléfono</Label>
                          <Input
                            id="orgTelefono"
                            value={profileData.orgTelefono}
                            onChange={(e) => setProfileData({ ...profileData, orgTelefono: e.target.value })}
                            disabled={!isEditing}
                            placeholder="+52 555 123 4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sitioWeb">Sitio Web</Label>
                          <Input
                            id="sitioWeb"
                            value={profileData.sitioWeb}
                            onChange={(e) => setProfileData({ ...profileData, sitioWeb: e.target.value })}
                            disabled={!isEditing}
                            placeholder="https://www.ejemplo.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción de la Organización</Label>
                        <Textarea
                          id="descripcion"
                          value={profileData.descripcion}
                          onChange={(e) => setProfileData({ ...profileData, descripcion: e.target.value })}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Describe la misión y visión de tu organización..."
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A4E6A]">
                  {userData?.voluntario ? "Historial de Participación" : 
                   userData?.organizaciones?.[0] ? "Campañas Creadas" : "Historial"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.voluntario?.registrosParticipacion?.length > 0 ? (
                  <div className="space-y-4">
                    {userData.voluntario.registrosParticipacion.map((registro: any) => (
                      <div key={registro.IDRegistro} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <h4 className="font-medium text-[#0A4E6A] mb-2">
                          {registro.campania?.Nombre || "Campaña sin nombre"}
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Organización:</strong> {registro.campania?.organizacion?.NombreOrganizacion || "N/A"}</p>
                          <p><strong>Fecha:</strong> {registro.FechaParticipacion ? new Date(registro.FechaParticipacion).toLocaleDateString('es-MX') : "N/A"}</p>
                          <p><strong>Horas trabajadas:</strong> {registro.HorasTrabajadas || 0} horas</p>
                          {registro.Observaciones && (
                            <p className="mt-2"><strong>Observaciones:</strong> {registro.Observaciones}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {userData?.voluntario ? "No hay historial de participación." : 
                     userData?.organizaciones?.[0] ? "No hay campañas creadas." : "No hay historial disponible."}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
