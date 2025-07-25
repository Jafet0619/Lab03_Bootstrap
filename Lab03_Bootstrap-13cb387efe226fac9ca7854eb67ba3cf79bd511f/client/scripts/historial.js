document.addEventListener('DOMContentLoaded', async () => {
    const historialContainer = document.getElementById('historial-container');
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) {
        historialContainer.innerHTML = '<div class="alert alert-warning text-center">Debes iniciar sesión para ver tu historial.</div>';
        return;
    }
    const usuario = JSON.parse(usuarioJSON);
    try {
        const res = await fetch('http://localhost:3000/api/pedidos/historial', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuario.email}` // Simple, para demo. Mejor usar JWT en producción.
            }
        });
        if (!res.ok) throw new Error('No se pudo obtener el historial');
        const data = await res.json();
        if (!data.pedidos || data.pedidos.length === 0) {
            historialContainer.innerHTML = '<div class="text-center text-muted">No tienes compras registradas.</div>';
            return;
        }
        let html = `<div class="table-responsive"><table class="table table-striped align-middle">
            <thead style="background:#232946;color:#eebbc3;">
                <tr>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>`;
        data.pedidos.forEach(pedido => {
            html += `<tr>
                <td>${new Date(pedido.fecha_pedido).toLocaleString()}</td>
                <td>`;
            pedido.productos.forEach(prod => {
                html += `<div><b>${prod.nombre}</b> x${prod.cantidad} - $${prod.precio_unitario.toFixed(2)}</div>`;
            });
            html += `</td>
                <td>$${Number(pedido.total).toFixed(2)}</td>
                <td>${pedido.estado}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        historialContainer.innerHTML = html;
    } catch (err) {
        historialContainer.innerHTML = `<div class="alert alert-danger text-center">Error: ${err.message}</div>`;
    }
}); 