import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// Eventos de conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error de conexión PostgreSQL:', err);
  process.exit(-1);
});

// Exportar con manejo de conexiones
export default {
  async query(text, params) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`📌 Query ejecutada en ${duration}ms`, { 
        query: text.split(' ')[0], 
        rows: res.rowCount 
      });
      return res;
    } catch (err) {
      console.error('❌ Error en query:', { 
        query: text, 
        error: err.message 
      });
      throw err;
    }
  },
  pool
};