import { Router } from "express";
import { AuthUserService } from "../services/authuser.service";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos"
      });
    }

    const result = await AuthUserService.login(email, password);

    if (result.success) {
      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          userId: result.userId,
          userRole: result.userRole
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message || "Credenciales incorrectas"
      });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      rol,
      fechaNacimiento,
      institucionEducativa
    } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben ser completados"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    // Usar el servicio de registro
    const result = await AuthUserService.register(
      nombre,
      email,
      password,
      rol,
      fechaNacimiento ? new Date(fechaNacimiento) : undefined,
      institucionEducativa
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          userRole: result.userRole
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

// GET /api/auth/profile/:userId
router.get("/profile/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    // Pendiente: Agregar un perfil
    res.json({
      success: true,
      message: "Perfil obtenido"
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

export default router;
