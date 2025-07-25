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