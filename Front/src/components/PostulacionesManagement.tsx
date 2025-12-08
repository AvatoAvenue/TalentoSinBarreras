import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface PostulacionesManagementProps {
  userId: number;
}

export function PostulacionesManagement({ userId }: PostulacionesManagementProps) {
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalPendientes: 0,
    totalEnRevision: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [accionDialog, setAccionDialog] = useState<{
    open: boolean;
    tipo: 'en_revision' | 'aceptada' | 'rechazada' | null;
    postulacionId: number | null;
  }>({
    open: false,
    tipo: null,
    postulacionId: null,
  });
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [notasOrg, setNotasOrg] = useState('');

  useEffect(() => {
    cargarPostulaciones();
  }, [userId]);

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/postulaciones/organizacion/${userId}`);
      const data = await response.json();

      if (data.success) {
        setPostulaciones(data.data.postulaciones);
        setEstadisticas(data.data.estadisticas);
      } else {
        toast.error(data.message || 'Error al cargar postulaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (postulacionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPostulacion(data.data);
        setDetalleOpen(true);
      } else {
        toast.error('Error al cargar detalle');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const abrirDialogAccion = (tipo: 'en_revision' | 'aceptada' | 'rechazada', postulacionId: number) => {
    setAccionDialog({ open: true, tipo, postulacionId });
    setMotivoRechazo('');
    setNotasOrg('');
  };

  const actualizarEstado = async () => {
    try {
      const { tipo, postulacionId } = accionDialog;

      if (!tipo || !postulacionId) return;

      const body: any = {
        estado: tipo,
      };

      if (tipo === 'rechazada' && motivoRechazo) {
        body.motivoRechazo = motivoRechazo;
      }

      if (notasOrg) {
        body.notasOrganizacion = notasOrg;
      }

      const response = await fetch(`${API_BASE_URL}/postulaciones/${postulacionId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Estado actualizado correctamente');
        setAccionDialog({ open: false, tipo: null, postulacionId: null });
        cargarPostulaciones();
        if (detalleOpen) setDetalleOpen(false);
      } else {
        toast.error(data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const configs: Record<string, { color: string; icon: any; text: string }> = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pendiente' },
      en_revision: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'En Revisión' },
      aceptada: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Aceptada' },
      rechazada: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rechazada' },
    };

    const config = configs[estado] || configs.pendiente;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const PostulacionCard = ({ postulacion }: { postulacion: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-[#0A4E6A] text-lg">
              {postulacion.voluntario.Nombre}
            </CardTitle>
            <CardDescription className="mt-1">
              {postulacion.campania.Nombre}
            </CardDescription>
          </div>
          {getEstadoBadge(postulacion.Estado)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{postulacion.voluntario.usuario.CorreoElectronico}</span>
          </div>

          {postulacion.voluntario.usuario.Telefono && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{postulacion.voluntario.usuario.Telefono}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Postulado: {new Date(postulacion.FechaPostulacion).toLocaleDateString('es-MX')}
            </span>
          </div>

          {postulacion.voluntario.tutor && (
            <div className="p-2 bg-blue-50 rounded text-sm">
              <p className="text-blue-800 font-medium">Tutor:</p>
              <p className="text-blue-700">{postulacion.voluntario.tutor.Nombre}</p>
              {postulacion.voluntario.tutor.Telefono && (
                <p className="text-blue-700">Tel: {postulacion.voluntario.tutor.Telefono}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => verDetalle(postulacion.IDPostulacion)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver Detalle
            </Button>

            {postulacion.Estado === 'pendiente' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => abrirDialogAccion('aceptada', postulacion.IDPostulacion)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => abrirDialogAccion('rechazada', postulacion.IDPostulacion)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rechazar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filtrarPorEstado = (estado: string) => {
    return postulaciones.filter((p) => p.Estado === estado);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A4E6A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#0A4E6A] text-2xl font-bold">Gestión de Postulaciones</h2>
        <p className="text-gray-600">Revisa y gestiona las postulaciones recibidas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <h3 className="text-[#0A4E6A] mt-1 text-2xl font-bold">
                  {estadisticas.totalPendientes}
                </h3>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Revisión</p>
                <h3 className="text-[#0A4E6A] mt-1 text-2xl font-bold">
                  {estadisticas.totalEnRevision}
                </h3>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <h3 className="text-[#0A4E6A] mt-1 text-2xl font-bold">
                  {estadisticas.total}
                </h3>
              </div>
              <FileText className="w-8 h-8 text-[#E86C4B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de postulaciones */}
      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pendientes">
            Pendientes ({estadisticas.totalPendientes})
          </TabsTrigger>
          <TabsTrigger value="revision">
            En Revisión ({estadisticas.totalEnRevision})
          </TabsTrigger>
          <TabsTrigger value="aceptadas">Aceptadas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {filtrarPorEstado('pendiente').length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay postulaciones pendientes</p>
                </CardContent>
              </Card>
            ) : (
              filtrarPorEstado('pendiente').map((p) => (
                <PostulacionCard key={p.IDPostulacion} postulacion={p} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="revision" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {filtrarPorEstado('en_revision').length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay postulaciones en revisión</p>
                </CardContent>
              </Card>
            ) : (
              filtrarPorEstado('en_revision').map((p) => (
                <PostulacionCard key={p.IDPostulacion} postulacion={p} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="aceptadas" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {filtrarPorEstado('aceptada').length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay postulaciones aceptadas</p>
                </CardContent>
              </Card>
            ) : (
              filtrarPorEstado('aceptada').map((p) => (
                <PostulacionCard key={p.IDPostulacion} postulacion={p} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="todas" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {postulaciones.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay postulaciones registradas</p>
                </CardContent>
              </Card>
            ) : (
              postulaciones.map((p) => (
                <PostulacionCard key={p.IDPostulacion} postulacion={p} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de detalle */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPostulacion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#0A4E6A]">
                  Detalle de Postulación
                </DialogTitle>
                <DialogDescription>
                  {selectedPostulacion.campania.Nombre}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Información del voluntario */}
                <div>
                  <h4 className="font-medium text-[#0A4E6A] mb-3">Información del Postulante</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {selectedPostulacion.voluntario.Nombre}</p>
                    <p><strong>Email:</strong> {selectedPostulacion.voluntario.usuario.CorreoElectronico}</p>
                    {selectedPostulacion.voluntario.usuario.Telefono && (
                      <p><strong>Teléfono:</strong> {selectedPostulacion.voluntario.usuario.Telefono}</p>
                    )}
                    <p><strong>Disponibilidad:</strong> {selectedPostulacion.Disponibilidad}</p>
                  </div>
                </div>

                {/* Tutor si existe */}
                {selectedPostulacion.voluntario.tutor && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Información del Tutor</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p><strong>Nombre:</strong> {selectedPostulacion.voluntario.tutor.Nombre}</p>
                      <p><strong>Parentesco:</strong> {selectedPostulacion.voluntario.tutor.Parentesco}</p>
                      {selectedPostulacion.voluntario.tutor.Telefono && (
                        <p><strong>Teléfono:</strong> {selectedPostulacion.voluntario.tutor.Telefono}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Carta de motivación */}
                <div>
                  <h4 className="font-medium text-[#0A4E6A] mb-2">Carta de Motivación</h4>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm">
                    {selectedPostulacion.CartaMotivacion}
                  </div>
                </div>

                {/* Experiencia */}
                <div>
                  <h4 className="font-medium text-[#0A4E6A] mb-2">Experiencia</h4>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm">
                    {selectedPostulacion.Experiencia}
                  </div>
                </div>

                {/* CV */}
                {selectedPostulacion.CVFileName && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm"><strong>CV adjunto:</strong> {selectedPostulacion.CVFileName}</p>
                  </div>
                )}

                {/* Estado */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Estado actual:</span>
                  {getEstadoBadge(selectedPostulacion.Estado)}
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedPostulacion.Estado === 'pendiente' && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        abrirDialogAccion('aceptada', selectedPostulacion.IDPostulacion);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aceptar Postulación
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        abrirDialogAccion('rechazada', selectedPostulacion.IDPostulacion);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setDetalleOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de acción (aceptar/rechazar) */}
      <Dialog open={accionDialog.open} onOpenChange={(open) => setAccionDialog({ ...accionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accionDialog.tipo === 'aceptada' ? 'Aceptar Postulación' : 'Rechazar Postulación'}
            </DialogTitle>
            <DialogDescription>
              {accionDialog.tipo === 'aceptada' 
                ? 'El voluntario será notificado de la aceptación.' 
                : 'Por favor, proporciona un motivo para el rechazo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {accionDialog.tipo === 'rechazada' && (
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo del rechazo *</Label>
                <Textarea
                  id="motivo"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Explica el motivo del rechazo..."
                  rows={4}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notas">Notas internas (opcional)</Label>
              <Textarea
                id="notas"
                value={notasOrg}
                onChange={(e) => setNotasOrg(e.target.value)}
                placeholder="Notas para uso interno de la organización..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAccionDialog({ open: false, tipo: null, postulacionId: null })}>
              Cancelar
            </Button>
            <Button
              onClick={actualizarEstado}
              className={accionDialog.tipo === 'aceptada' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={accionDialog.tipo === 'rechazada' ? 'destructive' : 'default'}
              disabled={accionDialog.tipo === 'rechazada' && !motivoRechazo.trim()}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
