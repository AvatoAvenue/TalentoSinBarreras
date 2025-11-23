import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Juan",
    paternalSurname: "Pérez",
    maternalSurname: "García",
    email: "juan.perez@email.com",
    phone: "+52 555 123 4567",
    role: "postulante",
    location: "Ciudad de México, CDMX",
    bio: "Desarrollador web apasionado por crear aplicaciones inclusivas y accesibles.",
    skills: "React, JavaScript, Diseño Accesible, HTML, CSS",
    education: "Licenciatura en Ciencias de la Computación",
    experience: "3 años como Desarrollador Frontend",
    disabilities: "Visual",
    accommodations: "Lector de pantalla, interfaces de alto contraste",
  });

  const handleSave = () => {
    setIsEditing(false);
    alert("Perfil actualizado exitosamente");
  };

  const initials = `${profileData.firstName.charAt(0)}${profileData.paternalSurname.charAt(0)}`;

  return (
    <div className="min-h-screen bg-[#F5FAFA]">
      {/* Header */}
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
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="" alt={`${profileData.firstName} ${profileData.paternalSurname}`} />
                  <AvatarFallback className="bg-[#0A4E6A] text-white text-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-[#E86C4B] rounded-full text-white hover:bg-[#d45a39] transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-[#0A4E6A] mb-1">
                  {profileData.firstName} {profileData.paternalSurname} {profileData.maternalSurname}
                </h2>
                <p className="text-gray-600 mb-2">{profileData.email}</p>
                <p className="text-gray-500 text-sm">{profileData.location}</p>
              </div>
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="bg-[#E86C4B] hover:bg-[#d45a39] text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
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

        {/* Profile Details */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Profesional</TabsTrigger>
            <TabsTrigger value="accessibility">Accesibilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A4E6A]">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre(s)</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paternalSurname">Apellido Paterno</Label>
                    <Input
                      id="paternalSurname"
                      value={profileData.paternalSurname}
                      onChange={(e) => setProfileData({ ...profileData, paternalSurname: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maternalSurname">Apellido Materno</Label>
                    <Input
                      id="maternalSurname"
                      value={profileData.maternalSurname}
                      onChange={(e) => setProfileData({ ...profileData, maternalSurname: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol de cuenta</Label>
                  <Select
                    value={profileData.role}
                    onValueChange={(value) => setProfileData({ ...profileData, role: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postulante">Postulante</SelectItem>
                      <SelectItem value="organismo">Organismo</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A4E6A]">Información Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Educación</Label>
                  <Textarea
                    id="education"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experiencia</Label>
                  <Textarea
                    id="experience"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Habilidades</Label>
                  <Textarea
                    id="skills"
                    value={profileData.skills}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Separa las habilidades con comas"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0A4E6A]">Necesidades de Accesibilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disabilities">Tipo de discapacidad (opcional)</Label>
                  <Input
                    id="disabilities"
                    value={profileData.disabilities}
                    onChange={(e) => setProfileData({ ...profileData, disabilities: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Ej: Visual, Auditiva, Motriz, Cognitiva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accommodations">Adaptaciones requeridas</Label>
                  <Textarea
                    id="accommodations"
                    value={profileData.accommodations}
                    onChange={(e) => setProfileData({ ...profileData, accommodations: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Describe las adaptaciones que necesitas en tu entorno laboral o educativo"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Esta información es confidencial y se utiliza únicamente para ofrecerte oportunidades 
                    que se adapten mejor a tus necesidades y para informar a los organismos sobre las 
                    adaptaciones necesarias.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
