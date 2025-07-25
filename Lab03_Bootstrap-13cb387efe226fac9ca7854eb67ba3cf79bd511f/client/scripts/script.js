// Carrito en memoria
// Cargar carrito desde localStorage si existe
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Referencias DOM
const carritoPanel = document.getElementById('carrito-panel');
const btnAbrir = document.getElementById('carrito-abrir');
const btnCerrar = document.getElementById('carrito-cerrar');
const listaCarrito = document.getElementById('carrito-lista');
const totalCarrito = document.getElementById('carrito-total');
const btnLimpiar = document.getElementById('carrito-limpiar');

// Abrir carrito
btnAbrir.addEventListener('click', function(e) {
    e.preventDefault();
    carritoPanel.classList.add('abierto');
});

// Cerrar carrito
btnCerrar.addEventListener('click', function() {
    carritoPanel.classList.remove('abierto');
});

// Agregar al carrito
document.querySelectorAll('.agregar-carrito').forEach(btn => {
    btn.addEventListener('click', function() {
        // Validar sesión antes de permitir agregar al carrito
        const usuarioJSON = localStorage.getItem('usuario');
        if (!usuarioJSON) {
            alert('Debes iniciar sesión para comprar.');
            return;
        }
        const producto = this.getAttribute('data-producto');
        const precio = parseFloat(this.getAttribute('data-precio'));
        // Buscar si ya existe el producto
        const existente = carrito.find(item => item.producto === producto);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ producto, precio, cantidad: 1 });
        }
        renderCarrito();
        carritoPanel.classList.add('abierto');
    });
});

// Eliminar producto individual
function eliminarProducto(index) {
    carrito.splice(index, 1);
    renderCarrito();
}

// Limpiar carrito
btnLimpiar.addEventListener('click', function() {
    carrito = [];
    renderCarrito();
});

// Renderizar carrito
function renderCarrito() {
    listaCarrito.innerHTML = '';
    let total = 0;
    carrito.forEach((item, idx) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.producto} ${item.cantidad > 1 ? `x${item.cantidad}` : ''} - $${subtotal.toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-danger ms-2" onclick="eliminarProducto(${idx})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
    });
    totalCarrito.textContent = `Total: $${total.toFixed(2)}`;
    
    // Guarda carrito en localStorage cada vez que cambia
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Para que eliminarProducto sea accesible desde el HTML
window.eliminarProducto = eliminarProducto;

// Inicializar carrito vacío
renderCarrito();