import db from './db.js';

// Traer todos los productos con su categoría (opcional) y total_vendido
export const obtenerInventario = async () => {
  const query = `
    SELECT 
      p.producto_id,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock,
      p.total_vendido,
      c.nombre AS categoria,
      p.imagen_url
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
    ORDER BY p.producto_id;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Calcular stock real basado en compras realizadas
export const calcularStockReal = async () => {
  const query = `
    WITH ventas_por_producto AS (
      SELECT 
        d.producto_id,
        SUM(d.cantidad) as cantidad_vendida
      FROM detalles_pedido d
      JOIN pedidos p ON d.pedido_id = p.pedido_id
      WHERE p.estado = 'entregado'
      GROUP BY d.producto_id
    )
    SELECT 
      p.producto_id,
      p.nombre,
      p.descripcion,
      p.precio,
      p.stock AS stock_inicial,
      p.total_vendido,
      c.nombre AS categoria,
      p.imagen_url,
      COALESCE(v.cantidad_vendida, 0) AS cantidad_vendida,
      (p.stock - COALESCE(v.cantidad_vendida, 0)) AS stock_real
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
    LEFT JOIN ventas_por_producto v ON p.producto_id = v.producto_id
    ORDER BY p.producto_id;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Actualizar el stock real en la base de datos
export const actualizarStockReal = async () => {
  const query = `
    WITH ventas_por_producto AS (
      SELECT 
        d.producto_id,
        SUM(d.cantidad) as cantidad_vendida
      FROM detalles_pedido d
      JOIN pedidos p ON d.pedido_id = p.pedido_id
      WHERE p.estado = 'entregado'
      GROUP BY d.producto_id
    )
    UPDATE productos 
    SET stock = (productos.stock - COALESCE(v.cantidad_vendida, 0))
    FROM ventas_por_producto v
    WHERE productos.producto_id = v.producto_id;
  `;
  await db.query(query);
};

// Función para recalcular y actualizar el stock de todos los productos
export const recalcularStockCompleto = async () => {
  try {
    // Primero, restaurar el stock inicial
    await db.query(`
      UPDATE productos 
      SET stock = CASE 
        WHEN nombre = 'Auriculares JBL' THEN 30
        WHEN nombre = 'Smartwatch Pro' THEN 25
        WHEN nombre = 'Teclado Mecánico RGB' THEN 20
        WHEN nombre = 'Mouse Inalámbrico' THEN 40
        WHEN nombre = 'Altavoz Portátil' THEN 22
        WHEN nombre = 'Cámara Web HD' THEN 18
        WHEN nombre = 'Cargador Rápido USB-C' THEN 35
        WHEN nombre = 'Tablet 10"' THEN 10
        WHEN nombre = 'Lámpara LED Escritorio' THEN 28
        ELSE stock
      END
    `);

    // Luego, aplicar los descuentos de las ventas realizadas
    await actualizarStockReal();
    
    return { success: true, message: 'Stock recalculado correctamente' };
  } catch (error) {
    console.error('Error al recalcular stock:', error);
    throw error;
  }
};