import { findByEmail, insertarUsuario } from '../models/usuarioModel.js';
import bcrypt from 'bcrypt';

// FUNCIÓN DE LOGIN
export const login = async (req, res) => {
    try {
        const { email, contraseña } = req.body;
        
        if (!email || !contraseña) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const usuario = await findByEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const match = await bcrypt.compare(contraseña, usuario.contraseña_hash);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.json({ 
            success: true, 
            usuario: { 
                usuario_id: usuario.usuario_id, 
                nombre: usuario.nombre,
                email: usuario.email,
                es_admin: usuario.es_admin
            } 
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            ...(process.env.NODE_ENV !== 'production' && { details: err.message })
        });
    }
};

// FUNCIÓN DE REGISTRO
export const registrar = async (req, res) => {
    try {
        const { nombre, apellido, email, contraseña, direccion, telefono } = req.body;

        // Validación de campos requeridos
        if (!email || !contraseña || !nombre || !apellido) {
            return res.status(400).json({ 
                error: 'Nombre, apellido, email y contraseña son campos requeridos' 
            });
        }

        // Validación básica de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'El formato del email es inválido' });
        }

        // Validación de contraseña
        if (contraseña.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const salt = await bcrypt.genSalt(10);
        const contraseña_hash = await bcrypt.hash(contraseña, salt);

        const nuevoUsuario = await insertarUsuario({
            nombre,
            apellido,
            email,
            contraseña_hash,
            direccion: direccion || null,
            telefono: telefono || null
        });

        res.status(201).json({ 
            success: true, 
            usuario_id: nuevoUsuario.usuario_id,
            message: 'Usuario registrado exitosamente'
        });

    } catch (err) {
        console.error('Error en registro:', err);
        
        if (err.code === '23505') { // Error de duplicado en PostgreSQL
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        res.status(500).json({ 
            error: 'Error al registrar el usuario',
            ...(process.env.NODE_ENV !== 'production' && { details: err.message })
        });
    }
};
