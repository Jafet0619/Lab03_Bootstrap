import db from './db.js';

// Obtener historial de compras de un usuario
export const obtenerHistorialPorUsuario = async (email) => {
    // Buscar usuario_id por email
    const usuarioRes = await db.query('SELECT usuario_id FROM usuarios WHERE email = $1', [email]);
    if (!usuarioRes.rows.length) return [];
    const usuario_id = usuarioRes.rows[0].usuario_id;
    // Obtener pedidos y detalles
    const pedidosRes = await db.query(
        `SELECT p.pedido_id, p.fecha_pedido, p.total, p.estado,
                json_agg(json_build_object('nombre', pr.nombre, 'cantidad', d.cantidad, 'precio_unitario', d.precio_unitario)) AS productos
         FROM pedidos p
         JOIN detalles_pedido d ON d.pedido_id = p.pedido_id
         JOIN productos pr ON pr.producto_id = d.producto_id
         WHERE p.usuario_id = $1
         GROUP BY p.pedido_id
         ORDER BY p.fecha_pedido DESC`,
        [usuario_id]
    );
    return pedidosRes.rows;
};

// Obtener compras de un usuario específico (para admin)
export const obtenerComprasDeUsuario = async (usuario_id) => {
    const pedidosRes = await db.query(
        `SELECT p.pedido_id, p.fecha_pedido, p.total, p.estado,
                json_agg(json_build_object('nombre', pr.nombre, 'cantidad', d.cantidad, 'precio_unitario', d.precio_unitario)) AS productos
         FROM pedidos p
         JOIN detalles_pedido d ON d.pedido_id = p.pedido_id
         JOIN productos pr ON pr.producto_id = d.producto_id
         WHERE p.usuario_id = $1
         GROUP BY p.pedido_id
         ORDER BY p.fecha_pedido DESC`,
        [usuario_id]
    );
    return pedidosRes.rows;
};

// Obtener todas las ventas (pedidos) con usuario y productos
export const obtenerTodasLasVentas = async () => {
    const pedidosRes = await db.query(
        `SELECT p.pedido_id, p.fecha_pedido, p.total, p.estado,
                u.nombre as usuario_nombre, u.email as usuario_email,
                json_agg(json_build_object('nombre', pr.nombre, 'cantidad', d.cantidad, 'precio_unitario', d.precio_unitario)) AS productos
         FROM pedidos p
         JOIN usuarios u ON u.usuario_id = p.usuario_id
         JOIN detalles_pedido d ON d.pedido_id = p.pedido_id
         JOIN productos pr ON pr.producto_id = d.producto_id
         GROUP BY p.pedido_id, u.nombre, u.email
         ORDER BY p.fecha_pedido DESC`
    );
    return pedidosRes.rows;
};

// Guardar pedido y detalles en la base de datos
export const guardarPedidoConDetalles = async (usuario_id, productos, total, referencia_pago) => {
    // Crear pedido
    const pedidoRes = await db.query(
        `INSERT INTO pedidos (usuario_id, total, estado, direccion_envio, metodo_pago) VALUES ($1, $2, $3, $4, $5) RETURNING pedido_id`,
        [usuario_id, total, 'entregado', 'No especificada', referencia_pago]
    );
    const pedido_id = pedidoRes.rows[0].pedido_id;
    // Insertar detalles
    for (const prod of productos) {
        // Buscar producto_id por nombre
        const prodRes = await db.query('SELECT producto_id FROM productos WHERE nombre = $1', [prod.producto]);
        if (!prodRes.rows.length) continue;
        const producto_id = prodRes.rows[0].producto_id;
        await db.query(
            `INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)`,
            [pedido_id, producto_id, prod.cantidad, prod.precio]
        );
    }
    return pedido_id;
};
