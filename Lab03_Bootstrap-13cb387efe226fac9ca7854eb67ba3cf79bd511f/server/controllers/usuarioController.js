import { obtenerUsuariosBasico } from '../models/usuarioModel.js';

export const obtenerListaUsuarios = async (req, res) => {
    try {
        const usuarios = await obtenerUsuariosBasico();
        res.json({ usuarios });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
    }
};
