// Back/src/index.ts
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import notificationRoutes from "./routes/notifications";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);

// Ruta de salud
app.get("/", (req: Request, res: Response) => {
  res.json({ 
    status: "OK", 
    message: "Servidor Talento sin Barreras funcionando",
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Error interno del servidor" 
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});
