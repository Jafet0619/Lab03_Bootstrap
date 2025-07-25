document.addEventListener('DOMContentLoaded', async () => {
    // Validar sesión antes de mostrar la página de pago
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) {
        alert('Debes iniciar sesión para realizar el pago.');
        window.location.href = '/client/pages/inicioSesion.html';
        return;
    }
    // 1. Cargar y mostrar carrito
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const listaProductos = document.getElementById('lista-productos');
    const totalPago = document.getElementById('total-pago');
    const form = document.getElementById('stripe-form');
    const errorElement = document.getElementById('stripe-error');

    // Mostrar productos y calcular total
    let total = 0;
    listaProductos.innerHTML = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        return `<li>${item.producto} x${item.cantidad} - $${subtotal.toFixed(2)}</li>`;
    }).join('');
    totalPago.textContent = total.toFixed(2);

    // 2. Configurar Stripe Elements
    const stripe = Stripe('pk_test_51RirNAH1KOaF4glWhWLFgdJxgaohAwHnJrm5G1LMq0iTDkJ30MEf7KF9eeDcGHcUxogWloWj6mWGRF8IpCQRvfGU0009Hb6hzd');
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a'
            }
        }
    });
    cardElement.mount('#card-element');

    // 3. Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorElement.textContent = '';
        form.querySelector('button').disabled = true;

        try {
            // Validar carrito no vacío
            if (carrito.length === 0 || total <= 0) {
                throw new Error('No hay productos en el carrito');
            }

            // Crear método de pago
            const { paymentMethod, error: paymentError } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement
            });

            if (paymentError) throw paymentError;

            // Crear intención de pago
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            const response = await fetch('http://localhost:3000/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(total * 100),
                    payment_method_id: paymentMethod.id,
                    metadata: {
                        productos: JSON.stringify(carrito),
                        user_id: usuario.usuario_id // Enviar el ID real del usuario
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el servidor');
            }

            // Confirmar el pago
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                data.clientSecret
            );

            if (confirmError) throw confirmError;

            // Pago exitoso - Redirigir a gracias.html
            if (paymentIntent.status === 'succeeded') {
                localStorage.removeItem('carrito');
                window.location.href = '/client/pages/gracias.html';
            }

        } catch (error) {
            console.error('Error en el pago:', error);
            errorElement.textContent = error.message;
            form.querySelector('button').disabled = false;
        }
    });
});