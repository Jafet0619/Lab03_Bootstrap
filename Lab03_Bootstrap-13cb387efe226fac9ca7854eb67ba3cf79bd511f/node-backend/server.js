// node-backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeRoutes from '../server/routes/stripe.routes.js';
import usuariosRouter from './routes/auth.js'; // 👈 importante .js al final

dotenv.config(); // Cargar .env

const app = express();

// Configuración CORS
const corsOptions = {
  origin: [
    'http://localhost:5500',
    'https://lab03-bootstrap.vercel.app'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== RUTAS PRINCIPALES ================== //

// Stripe
app.use('/api/stripe', stripeRoutes);

// Auth
app.use('/api', usuariosRouter);

// ================== LOGGING ================== //
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ================== MANEJO DE ERRORES ================== //

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// Middleware de errores generales
app.use((err, req, res, next) => {
  console.error('🔥 Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// ================== INICIO DEL SERVIDOR ================== //

// Solo en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
  });
}

// 👇 Importante para Vercel (no afecta local)
export default app;

