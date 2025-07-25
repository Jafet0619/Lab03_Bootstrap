import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import stripeRoutes from './routes/stripe.routes.js';
import usuariosRouter from './routes/auth.js';
import productosRouter from './routes/productos.js';
import pedidosRouter from './routes/pedidos.js';


const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    'https://lab03-bootstrap.vercel.app'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/stripe', stripeRoutes);
app.use('/api', usuariosRouter);
app.use('/api', productosRouter);
app.use('/api/pedidos', pedidosRouter);
app.get('/cors-test', (req, res) => {
  res.json({ ok: true });
});

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// Errores generales
app.use((err, req, res, next) => {
  console.error('🔥 Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Arranque local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
  });
}

// Export para Vercel (opcional, no afecta local)
export default app;


