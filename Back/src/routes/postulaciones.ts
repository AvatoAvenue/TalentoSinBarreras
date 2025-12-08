import { Router } from "express";
import { PostulacionesService } from "../services/postulaciones.service";

const router = Router();

// POST /api/postulaciones - Crear nueva postulación
router.post("/", async (req, res) => {
  try {
    const {
      userId, // Cambiado de idVoluntario a userId
      idCampania,
      cartaMotivacion,
      experiencia,
      disponibilidad,
      cvFileName
    } = req.body;

    if (!userId || !idCampania || !cartaMotivacion || !experiencia || !disponibilidad) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos"
      });
    }

    const result = await PostulacionesService.crear({
      userId, // Cambiado
      idCampania,
      cartaMotivacion,
      experiencia,
      disponibilidad,
      cvFileName
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al crear postulación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// GET /api/postulaciones/organizacion/:userId - Obtener postulaciones de la organización
router.get("/organizacion/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { estado, idCampania } = req.query;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const result = await PostulacionesService.obtenerPorOrganizacion(userId, {
      estado: estado as string,
      idCampania: idCampania ? parseInt(idCampania as string) : undefined
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error al obtener postulaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// GET /api/postulaciones/:id - Obtener detalle de postulación
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido"
      });
    }

    const result = await PostulacionesService.obtenerDetalle(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// PUT /api/postulaciones/:id/estado - Actualizar estado
router.put("/:id/estado", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { estado, motivoRechazo, notasOrganizacion } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido"
      });
    }

    if (!estado || !['en_revision', 'aceptada', 'rechazada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido"
      });
    }

    const result = await PostulacionesService.actualizarEstado(id, estado, {
      motivoRechazo,
      notasOrganizacion
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

export default router;
