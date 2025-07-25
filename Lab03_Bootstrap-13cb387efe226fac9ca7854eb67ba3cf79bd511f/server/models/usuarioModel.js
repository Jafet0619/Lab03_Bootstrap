import db from './db.js';

// Para login
export const findByEmail = async (email) => {
    const res = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return res.rows[0];
};

// Para registro (nombre consistente con el controlador)
export const insertarUsuario = async (usuario) => {
    const { nombre, apellido, email, contraseña_hash, direccion, telefono } = usuario;
    const res = await db.query(
        `INSERT INTO usuarios 
        (nombre, apellido, email, contraseña_hash, direccion, telefono) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING usuario_id, email, nombre`, // Devuelve solo datos no sensibles
        [nombre, apellido, email, contraseña_hash, direccion, telefono]
    );
    return res.rows[0];
};

// Obtener lista básica de usuarios
export const obtenerUsuariosBasico = async () => {
    const res = await db.query('SELECT usuario_id, nombre, email FROM usuarios ORDER BY nombre');
    return res.rows;
};