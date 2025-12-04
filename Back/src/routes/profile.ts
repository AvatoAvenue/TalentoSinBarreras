import { Router } from "express";
import { ProfileService } from "../services/profile.service";

const router = Router();

// GET /api/profile/:userId - Obtener perfil completo
router.get("/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        const result = await ProfileService.getProfile(userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/profile/:userId/basic - Actualizar información básica
router.put("/:userId/basic", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        const { nombre, telefono, biografia } = req.body;

        const result = await ProfileService.updateUserProfile(userId, {
            nombre,
            telefono,
            biografia
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/profile/:userId/voluntario - Actualizar perfil de voluntario
router.put("/:userId/voluntario", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        const {
            nombre,
            fechaNacimiento,
            institucionEducativa,
            tipoDiscapacidad,
            adaptacionesRequeridas,
            habilidades
        } = req.body;

        const result = await ProfileService.updateVoluntarioProfile(userId, {
            nombre,
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
            institucionEducativa,
            tipoDiscapacidad,
            adaptacionesRequeridas,
            habilidades
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error al actualizar voluntario:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/profile/:userId/tutor - Actualizar perfil de tutor
router.put("/:userId/tutor", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        const {
            nombre,
            fechaNacimiento,
            parentesco,
            telefono,
            direccionCompleta
        } = req.body;

        const result = await ProfileService.updateTutorProfile(userId, {
            nombre,
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
            parentesco,
            telefono,
            direccionCompleta
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error al actualizar tutor:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/profile/:userId/organizacion - Actualizar perfil de organización
router.put("/:userId/organizacion", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        const {
            nombreOrganizacion,
            tipoOrganizacion,
            categoriaPrincipal,
            responsable,
            telefono,
            descripcion,
            sitioWeb
        } = req.body;

        const result = await ProfileService.updateOrganizacionProfile(userId, {
            nombreOrganizacion,
            tipoOrganizacion,
            categoriaPrincipal,
            responsable,
            telefono,
            descripcion,
            sitioWeb
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error al actualizar organización:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/profile/:userId/voluntario/:voluntarioId - Tutor actualiza perfil del voluntario
router.put("/:userId/voluntario/:voluntarioId", async (req, res) => {
    try {
        const tutorUserId = parseInt(req.params.userId);
        const voluntarioId = parseInt(req.params.voluntarioId);
        
        if (isNaN(tutorUserId) || isNaN(voluntarioId)) {
            return res.status(400).json({
                success: false,
                message: "IDs inválidos"
            });
        }

        const {
            nombre,
            fechaNacimiento,
            institucionEducativa,
            tipoDiscapacidad,
            adaptacionesRequeridas,
            habilidades
        } = req.body;

        const result = await ProfileService.updateVoluntarioByTutor(
            tutorUserId,
            voluntarioId,
            {
                nombre,
                fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
                institucionEducativa,
                tipoDiscapacidad,
                adaptacionesRequeridas,
                habilidades
            }
        );

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error al actualizar voluntario por tutor:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

export default router;
