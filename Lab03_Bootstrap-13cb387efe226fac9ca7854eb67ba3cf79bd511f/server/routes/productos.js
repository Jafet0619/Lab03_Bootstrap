import express from 'express';
import { obtenerInventario, calcularStockReal, actualizarStockReal, recalcularStockCompleto } from '../models/productoModel.js';

const router = express.Router();

// Obtener inventario normal
router.get('/inventario', async (req, res) => {
  try {
    const inventario = await obtenerInventario();
    res.json(inventario);
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

// Obtener inventario con stock real calculado
router.get('/inventario/stock-real', async (req, res) => {
  try {
    const inventario = await calcularStockReal();
    res.json(inventario);
  } catch (err) {
    console.error('Error al obtener inventario con stock real:', err);
    res.status(500).json({ error: 'Error al obtener el inventario con stock real' });
  }
});

// Actualizar stock real en la base de datos
router.post('/inventario/actualizar-stock', async (req, res) => {
  try {
    await actualizarStockReal();
    res.json({ message: 'Stock actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar stock:', err);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
});

// Recalcular stock completo basado en ventas realizadas
router.post('/inventario/recalcular-stock', async (req, res) => {
  try {
    const result = await recalcularStockCompleto();
    res.json(result);
  } catch (err) {
    console.error('Error al recalcular stock:', err);
    res.status(500).json({ error: 'Error al recalcular el stock' });
  }
});

export default router;