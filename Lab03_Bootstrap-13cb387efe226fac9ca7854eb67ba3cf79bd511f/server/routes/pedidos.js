import express from 'express';
import { historialUsuario, comprasDeUsuario, todasLasVentas } from '../controllers/pedidoController.js';

const router = express.Router();

// Historial de compras del usuario autenticado
router.get('/historial', historialUsuario);
// Compras de un usuario específico (admin)
router.get('/usuario/:usuario_id', comprasDeUsuario);
// Todas las ventas (admin)
router.get('/todas', todasLasVentas);

export default router;
