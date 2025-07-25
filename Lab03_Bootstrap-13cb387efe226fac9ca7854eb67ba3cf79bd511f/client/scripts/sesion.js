// Alternar entre login y registro
document.getElementById('show-register').addEventListener('click', function() {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-register').style.display = '';
});

document.getElementById('show-login').addEventListener('click', function() {
    document.getElementById('form-register').style.display = 'none';
    document.getElementById('form-login').style.display = '';
});

// Puedes agregar aquí la lógica de validación o envío de formularios si lo necesitas
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Llamar al backend para autenticar y obtener datos del usuario
        const res = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, contraseña: password })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        // data.usuario debe contener { nombre, email, ... }
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        alert('Inicio de sesión exitoso');
        setTimeout(() => {
            window.location.href = '/tienda.html';
        }, 1000);
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
});

// Lógica de registro para el inicio de sesión
document.getElementById('form-register').addEventListener('submit', async function(e) {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById('register-name').value,
        apellido: document.getElementById('register-lastname').value,
        email: document.getElementById('register-email').value,
        contraseña: document.getElementById('register-password').value,
        direccion: document.getElementById('register-address').value,
        telefono: document.getElementById('register-phone').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/usuarios/registrar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        alert('Registro exitoso!');
        console.log(data);

        setTimeout(() => {
            window.location.href =  '../pages/inicioSesion.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error completo:', error);
        alert(`Error: ${error.message}`);
    }
});
