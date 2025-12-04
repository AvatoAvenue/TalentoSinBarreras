import { useState, useEffect, useCallback } from 'react';

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
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useNotifications(userId: number | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notificaciones);
        setUnreadCount(data.data.totalNoLeidas);
      } else {
        setError(data.message || 'Error al cargar notificaciones');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    if (!userId) return;

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
              ? { ...n, Estado: 'leida' as const, FechaLeida: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al marcar como leída:', err);
      return false;
    }
  }, [userId]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

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
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      return false;
    }
  }, [userId]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: number) => {
    if (!userId) return;

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
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      return false;
    }
  }, [userId, notifications]);

  // Cargar al montar y configurar polling
  useEffect(() => {
    if (userId) {
      loadNotifications();
      
      // Actualizar cada 30 segundos
      const interval = setInterval(loadNotifications, 30000);

      return () => clearInterval(interval);
    }
  }, [userId, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
