import { Router } from "express";
import { NotificationService } from "../services/notification.service";

const router = Router();

// GET /api/notifications/:userId - Obtener notificaciones del usuario
router.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { limite, soloNoLeidas, tipo } = req.query;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const result = await NotificationService.obtenerPorUsuario(userId, {
      limite: limite ? parseInt(limite as string) : undefined,
      soloNoLeidas: soloNoLeidas === 'true',
      tipo: tipo as any
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// POST /api/notifications - Crear notificación (uso interno o testing)
router.post("/", async (req, res) => {
  try {
    const { idUsuario, tipo, titulo, mensaje, metadata, idCampania, idRegistro, idCertificado, idMulta } = req.body;

    if (!idUsuario || !tipo || !titulo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos"
      });
    }

    const result = await NotificationService.crear({
      idUsuario,
      tipo,
      titulo,
      mensaje,
      metadata,
      idCampania,
      idRegistro,
      idCertificado,
      idMulta
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// PUT /api/notifications/:notificationId/read - Marcar como leída
router.put("/:notificationId/read", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    const { userId } = req.body;

    if (isNaN(notificationId) || !userId) {
      return res.status(400).json({
        success: false,
        message: "Parámetros inválidos"
      });
    }

    const result = await NotificationService.marcarComoLeida(notificationId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// PUT /api/notifications/:userId/read-all - Marcar todas como leídas
router.put("/:userId/read-all", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const result = await NotificationService.marcarTodasComoLeidas(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al marcar notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// PUT /api/notifications/:notificationId/archive - Archivar notificación
router.put("/:notificationId/archive", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    const { userId } = req.body;

    if (isNaN(notificationId) || !userId) {
      return res.status(400).json({
        success: false,
        message: "Parámetros inválidos"
      });
    }

    const result = await NotificationService.archivar(notificationId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al archivar notificación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// DELETE /api/notifications/:notificationId - Eliminar notificación
router.delete("/:notificationId", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    const { userId } = req.body;

    if (isNaN(notificationId) || !userId) {
      return res.status(400).json({
        success: false,
        message: "Parámetros inválidos"
      });
    }

    const result = await NotificationService.eliminar(notificationId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

export default router;
