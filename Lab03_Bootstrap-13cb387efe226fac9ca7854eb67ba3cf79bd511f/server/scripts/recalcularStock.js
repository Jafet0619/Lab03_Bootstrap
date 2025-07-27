import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la base de datos (usando la misma que el proyecto)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/tienda_virtual',
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// Script para recalcular el stock basado en las ventas realizadas
async function recalcularStockInicial() {
  try {
    console.log('🔄 Iniciando recálculo de stock...');
    
    // 1. Primero, restaurar el stock inicial de todos los productos
    console.log('📦 Restaurando stock inicial...');
    await pool.query(`
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
    
    // 2. Calcular las ventas realizadas por producto
    console.log('📊 Calculando ventas realizadas...');
    const ventasResult = await pool.query(`
      SELECT 
        d.producto_id,
        p.nombre,
        SUM(d.cantidad) as cantidad_vendida
      FROM detalles_pedido d
      JOIN pedidos ped ON d.pedido_id = ped.pedido_id
      JOIN productos p ON d.producto_id = p.producto_id
      WHERE ped.estado = 'entregado'
      GROUP BY d.producto_id, p.nombre
      ORDER BY p.nombre
    `);
    
    console.log('📋 Ventas encontradas:');
    ventasResult.rows.forEach(row => {
      console.log(`  - ${row.nombre}: ${row.cantidad_vendida} unidades vendidas`);
    });
    
    // 3. Aplicar los descuentos de stock
    console.log('💾 Aplicando descuentos de stock...');
    for (const venta of ventasResult.rows) {
      await pool.query(`
        UPDATE productos 
        SET stock = stock - $1
        WHERE producto_id = $2
      `, [venta.cantidad_vendida, venta.producto_id]);
      
      console.log(`  ✅ ${venta.nombre}: Stock actualizado`);
    }
    
    // 4. Verificar el resultado final
    console.log('🔍 Verificando stock final...');
    const stockFinal = await pool.query(`
      SELECT nombre, stock, total_vendido
      FROM productos
      ORDER BY nombre
    `);
    
    console.log('\n📊 Stock final por producto:');
    stockFinal.rows.forEach(row => {
      console.log(`  - ${row.nombre}: ${row.stock} disponibles (${row.total_vendido} vendidos)`);
    });
    
    console.log('\n✅ Recálculo de stock completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el recálculo:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
recalcularStockInicial().catch(console.error); 