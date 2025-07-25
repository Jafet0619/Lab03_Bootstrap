// document.addEventListener('DOMContentLoaded', async () => {
//   const tbody = document.querySelector('#inventario-table tbody');
  
//   // Estado de carga
//   tbody.innerHTML = `
//     <tr>
//       <td colspan="7" class="loading">
//         <div class="spinner"></div>
//         Cargando inventario...
//       </td>
//     </tr>
//   `;

//   try {
//     // URL dinámica para desarrollo/producción
//     const apiUrl = window.location.hostname === 'localhost' 
//       ? 'http://localhost:3000/api/inventario'
//       : window.location.origin + '/api/inventario'; // Usa la URL actual (Render)
    
//     console.log(`🔍 Consultando: ${apiUrl}`);
    
//     const response = await fetch(apiUrl, {
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       const error = await response.json().catch(() => null);
//       throw new Error(error?.message || `Error HTTP: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('📊 Datos recibidos:', data);
    
//     if (!data || data.length === 0) {
//       throw new Error('No hay productos registrados');
//     }

//     renderizarInventario(data);
    
//   } catch (err) {
//     console.error('❌ Error al cargar inventario:', err);
//     mostrarError(err.message);
//   }
// });

// function renderizarInventario(productos) {
//   const tbody = document.querySelector('#inventario-table tbody');
  
//   tbody.innerHTML = productos.map(producto => {
//     const precioFormateado = producto.precio 
//       ? `$${Number(producto.precio).toFixed(2)}` 
//       : '$0.00';
    
//     const stockClass = producto.stock < 3 ? 'low-stock' : 
//                       producto.stock < 10 ? 'medium-stock' : '';
    
//     return `
//       <tr>
//         <td>${producto.producto_id || 'N/A'}</td>
//         <td>${producto.nombre || 'N/A'}</td>
//         <td>${producto.descripcion || 'Sin descripción'}</td>
//         <td>${precioFormateado}</td>
//         <td class="${stockClass}">${producto.stock || 0}</td>
//         <td>${producto.total_vendido || 0}</td>
//         <td>${producto.categoria || 'Sin categoría'}</td>
//       </tr>
//     `;
//   }).join('');
// }

// function mostrarError(mensaje) {
//   const tbody = document.querySelector('#inventario-table tbody');
//   tbody.innerHTML = `
//     <tr>
//       <td colspan="7" class="error">
//         <div class="error-content">
//           <div class="error-icon">⚠️</div>
//           <div class="error-details">
//             <h3>Error al cargar el inventario</h3>
//             <p>${mensaje}</p>
//             <button class="retry-btn" onclick="window.location.reload()">
//               <i class="fas fa-sync-alt"></i> Reintentar
//             </button>
//           </div>
//         </div>
//       </td>
//     </tr>
//   `;
// }

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('#inventario-table tbody');
  const loadingHTML = `
    <tr>
      <td colspan="7" class="loading">
        <div class="spinner"></div>
        <span>Cargando inventario...</span>
      </td>
    </tr>
  `;

  const showLoading = () => {
    tbody.innerHTML = loadingHTML;
  };

  const loadInventory = async () => {
    showLoading();
    
    try {
      const response = await fetch('http://127.0.0.1:3000/api/inventario');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido');
      }

      renderInventory(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      showError(err.message.includes('500') ? 
        'Error en el servidor. Por favor intente más tarde.' : 
        err.message
      );
    }
  };

  const renderInventory = (products) => {
    if (!products || products.length === 0) {
      showError('No hay productos registrados');
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.producto_id}</td>
        <td>
          <img src="${product.imagen_url ? '/client/src' + product.imagen_url : '/client/src/assets/img/default-product.png'}" 
               alt="${product.nombre}" 
               class="product-img"
               onerror="this.onerror=null;this.src='/assets/img/default-product.png'">
          ${product.nombre}
        </td>
        <td>${product.descripcion || 'Sin descripción'}</td>
        <td>$${product.precio}</td>
        <td class="${getStockClass(product.stock)}">${product.stock}</td>
        <td>${product.total_vendido || 0}</td>
        <td>${product.categoria || 'General'}</td>
      </tr>
    `).join('');
  };

  const getStockClass = (stock) => {
    const stockNum = Number(stock) || 0;
    if (stockNum < 3) return 'low-stock';
    if (stockNum < 10) return 'medium-stock';
    return '';
  };

  const showError = (message) => {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="error">
          <div class="error-content">
            <div class="error-icon">⚠️</div>
            <div class="error-details">
              <h3>Error al cargar el inventario</h3>
              <p>${message}</p>
              <button class="retry-btn" onclick="window.location.reload()">
                <i class="fas fa-sync-alt"></i> Reintentar
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
  };

  // Carga inicial
  loadInventory();

  // Sección de ventas del sistema para admin
  const usuarioJSON = localStorage.getItem('usuario');
  const ventasSection = document.getElementById('ventas-admin-section');
  const ventasContainer = document.getElementById('ventas-admin-container');
  if (usuarioJSON && JSON.parse(usuarioJSON).es_admin === true) {
      const filtroUsuario = document.getElementById('filtro-usuario');
      let usuariosLista = [];
      let ventasTodas = [];
      // Cargar usuarios para el filtro
      try {
          const resUsuarios = await fetch('http://localhost:3000/api/usuarios/lista');
          if (resUsuarios.ok) {
              const dataUsuarios = await resUsuarios.json();
              usuariosLista = dataUsuarios.usuarios;
              filtroUsuario.innerHTML = '<option value="">Todos los usuarios</option>' + usuariosLista.map(u => `<option value="${u.usuario_id}">${u.nombre} (${u.email})</option>`).join('');
          }
      } catch {}
      // Función para renderizar ventas
      async function renderVentas(usuario_id = '') {
          ventasContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center" style="height:80px;"><div class="spinner-border text-primary" style="width:3rem;height:3rem;" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
          let url = 'http://localhost:3000/api/pedidos/todas?admin=true';
          if (usuario_id) url = `http://localhost:3000/api/pedidos/usuario/${usuario_id}?admin=true`;
          const res = await fetch(url);
          if (!res.ok) { ventasContainer.innerHTML = '<div class="alert alert-danger">Error al obtener ventas</div>'; return; }
          const data = await res.json();
          ventasTodas = data.pedidos || [];
          if (!ventasTodas.length) {
              ventasContainer.innerHTML = '<div class="text-muted">No hay ventas registradas.</div>';
              return;
          }
          let tabla = `<div class="table-responsive"><table class="table table-striped align-middle ventas-table" style="border-radius:16px;overflow:hidden;box-shadow:0 4px 24px 0 rgba(35,41,70,0.10);background:#f8fafc;">
              <thead style="background:linear-gradient(90deg,#232946 60%,#eebbc3 100%);color:#fff;letter-spacing:1px;font-size:1.08em;">
                  <tr><th>Fecha</th><th>Usuario</th><th>Productos</th><th>Total</th><th>Estado</th></tr>
              </thead><tbody>`;
          ventasTodas.forEach(pedido => {
              tabla += `<tr style="background:#fff;">`;
              tabla += `<td style="color:#232946;font-weight:600;">${new Date(pedido.fecha_pedido).toLocaleString()}</td>`;
              tabla += `<td><span style="color:#232946;font-weight:600;">${pedido.usuario_nombre || ''}</span><br><span style="color:#b8c1ec;font-size:0.95em;">${pedido.usuario_email || ''}</span></td>`;
              tabla += '<td>';
              pedido.productos.forEach(prod => {
                  tabla += `<div style="color:#232946;"><b>${prod.nombre}</b> <span style="color:#eebbc3;font-weight:700;">x${prod.cantidad}</span> <span style="color:#393e46;">- $${Number(prod.precio_unitario).toFixed(2)}</span></div>`;
              });
              tabla += `</td><td style="color:#5a4fcf;font-weight:700;">$${Number(pedido.total).toFixed(2)}</td>`;
              tabla += `<td><span class="badge" style="background:linear-gradient(90deg,#eebbc3 0%,#b8c1ec 100%);color:#232946;font-weight:700;font-size:1em;padding:7px 16px;border-radius:10px;">${pedido.estado}</span></td></tr>`;
          });
          tabla += '</tbody></table></div>';
          ventasContainer.innerHTML = tabla;
      }
      // Inicial
      renderVentas();
      filtroUsuario.addEventListener('change', function() {
          renderVentas(this.value);
      });
  } else {
      ventasSection.style.display = 'none';
  }
});