import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  Award,
  UserPlus,
  FileText,
  XCircle,
  RefreshCw
} from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "sonner";

interface Notification {
  IDNotificacion: number;
  Tipo: string;
  Titulo: string;
  Mensaje: string;
  Estado: 'no_leida' | 'leida' | 'archivada';
  FechaCreacion: string;
  FechaLeida?: string;
  Metadata?: any;
  IDCampania?: number;
  campania?: {
    IDCampania: number;
    Nombre: string;
    Estado: string;
  };
}

interface NotificationCenterProps {
  userId: number;
  onNotificationClick?: (notification: Notification) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Iconos según tipo de notificación
const getNotificationIcon = (tipo: string) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (tipo) {
    case 'campania_actualizada':
      return <RefreshCw {...iconProps} className="text-blue-600" />;
    case 'campania_aprobada':
      return <CheckCircle {...iconProps} className="text-green-600" />;
    case 'campania_rechazada':
      return <XCircle {...iconProps} className="text-red-600" />;
    case 'nueva_postulacion':
      return <UserPlus {...iconProps} className="text-purple-600" />;
    case 'postulacion_aceptada':
      return <CheckCircle {...iconProps} className="text-green-600" />;
    case 'postulacion_rechazada':
      return <XCircle {...iconProps} className="text-red-600" />;
    case 'certificado_emitido':
      return <Award {...iconProps} className="text-yellow-600" />;
    case 'multa_asignada':
      return <AlertCircle {...iconProps} className="text-red-600" />;
    case 'recordatorio':
      return <Info {...iconProps} className="text-blue-600" />;
    case 'sistema':
      return <FileText {...iconProps} className="text-gray-600" />;
    default:
      return <Bell {...iconProps} className="text-gray-600" />;
  }
};

// Colores según tipo
const getNotificationColor = (tipo: string) => {
  switch (tipo) {
    case 'campania_aprobada':
    case 'postulacion_aceptada':
    case 'certificado_emitido':
      return 'bg-green-50 border-green-200';
    case 'campania_rechazada':
    case 'postulacion_rechazada':
    case 'multa_asignada':
      return 'bg-red-50 border-red-200';
    case 'campania_actualizada':
    case 'recordatorio':
      return 'bg-blue-50 border-blue-200';
    case 'nueva_postulacion':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function NotificationCenter({ userId, onNotificationClick }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar notificaciones
  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notificaciones);
        setUnreadCount(data.data.totalNoLeidas);
      } else {
        toast.error("Error al cargar notificaciones");
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadNotifications();
      
      // Actualizar cada 30 segundos
      const interval = setInterval(() => {
        loadNotifications(false);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  // Marcar como leída
  const markAsRead = async (notificationId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.IDNotificacion === notificationId
              ? { ...n, Estado: 'leida', FechaLeida: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${userId}/read-all`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, Estado: 'leida' as const, FechaLeida: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success("Todas las notificaciones marcadas como leídas");
      }
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
      toast.error("Error al actualizar notificaciones");
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );

      const data = await response.json();

      if (data.success) {
        const notification = notifications.find(n => n.IDNotificacion === notificationId);
        
        setNotifications(prev =>
          prev.filter(n => n.IDNotificacion !== notificationId)
        );
        
        if (notification?.Estado === 'no_leida') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success("Notificación eliminada");
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      toast.error("Error al eliminar");
    }
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Manejar clic en notificación
  const handleNotificationClick = (notification: Notification) => {
    if (notification.Estado === 'no_leida') {
      markAsRead(notification.IDNotificacion);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5 text-[#0A4E6A]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E86C4B] opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-[#E86C4B] text-white text-xs font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[#0A4E6A]">Notificaciones</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-[#E86C4B] text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadNotifications(false)}
                disabled={refreshing}
                className="h-8 w-8"
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  refreshing && "animate-spin"
                )} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={markAllAsRead}
                  className="h-8 w-8"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-[#0A4E6A]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                <p className="text-gray-400 text-sm">Te avisaremos cuando haya novedades</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.IDNotificacion}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-gray-50",
                      notification.Estado === 'no_leida' && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Icono */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.Tipo)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={cn(
                            "text-sm font-medium text-gray-900",
                            notification.Estado === 'no_leida' && "font-semibold"
                          )}>
                            {notification.Titulo}
                          </p>
                          {notification.Estado === 'no_leida' && (
                            <div className="w-2 h-2 bg-[#E86C4B] rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.Mensaje}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.FechaCreacion)}
                          </span>
                          <div className="flex items-center gap-1">
                            {notification.Estado === 'no_leida' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => markAsRead(notification.IDNotificacion, e)}
                                className="h-7 w-7"
                                title="Marcar como leída"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => deleteNotification(notification.IDNotificacion, e)}
                              className="h-7 w-7 text-red-600 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
