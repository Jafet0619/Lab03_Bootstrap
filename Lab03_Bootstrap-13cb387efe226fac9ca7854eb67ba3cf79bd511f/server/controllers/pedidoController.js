import { obtenerHistorialPorUsuario, obtenerComprasDeUsuario, obtenerTodasLasVentas } from '../models/pedidoModel.js';

// Historial de compras del usuario autenticado
export const historialUsuario = async (req, res) => {
    try {
        // Para demo, autenticación simple por email en header. En producción usar JWT.
        const email = req.headers.authorization?.replace('Bearer ', '').trim();
        if (!email) return res.status(401).json({ error: 'No autenticado' });
        const pedidos = await obtenerHistorialPorUsuario(email);
        res.json({ pedidos });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial', details: err.message });
    }
};

// Compras de un usuario específico (admin)
export const comprasDeUsuario = async (req, res) => {
    try {
        // Validar admin (en producción usar JWT y roles)
        const { admin } = req.query;
        if (!admin || admin !== 'true') return res.status(403).json({ error: 'Solo admin puede consultar' });
        const { usuario_id } = req.params;
        const pedidos = await obtenerComprasDeUsuario(usuario_id);
        res.json({ pedidos });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener compras de usuario', details: err.message });
    }
};

export const todasLasVentas = async (req, res) => {
    try {
        // Validar admin (en producción usar JWT y roles)
        const { admin } = req.query;
        if (!admin || admin !== 'true') return res.status(403).json({ error: 'Solo admin puede consultar' });
        const pedidos = await obtenerTodasLasVentas();
        res.json({ pedidos });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener ventas', details: err.message });
    }
};
