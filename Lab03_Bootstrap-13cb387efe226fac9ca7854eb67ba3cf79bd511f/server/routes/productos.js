import express from 'express';
import { obtenerInventario } from '../models/productoModel.js';

const router = express.Router();

router.get('/inventario', async (req, res) => {
  try {
    const inventario = await obtenerInventario();
    res.json(inventario);
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

export default router;