document.getElementById('registar').addEventListener('click', async (event) => {
    event.preventDefault();  // Esto previene que el formulario se envíe de manera tradicional

    const nombre = document.getElementById('nombre').value.trim();
    const apellidoP = document.getElementById('apellidoP').value.trim();
    const apellidoM = document.getElementById('apellidoM').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const passwordR = document.getElementById('password').value.trim();
    const emailR = document.getElementById('emailR').value.trim();

    if (!/^\S+@\S+\.\S+$/.test(emailR)) {
        Swal.fire({
            icon: "error",
            title: "Email no válido",
            text: "Por favor, introduce un correo electrónico válido."
        });
        return;
    }

    const userData = {
        nombre: nombre,
        apellidoP: apellidoP,
        apellidoM: apellidoM,
        telefono: telefono,
        correo: emailR,
        password: passwordR,
    };

    console.log("Datos a enviar:", userData);

    const requestBody = JSON.stringify(userData);
    const response = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: requestBody,
    });

    if (response.ok) {
        Swal.fire({
            icon: "success",
            title: "Se ha registrado con éxito",
            showConfirmButton: false,
            timer: 1500
            
        });
        // Redirecciona según necesites, función goToInit() sugerida para seguir con tu flujo
    } else {
        const errorResponse = await response.json(); // Captura y muestra error del servidor
        Swal.fire({
            icon: "error",
            title: "Error al registrar",
            text: errorResponse.message || "No se completó el registro, vuelve a intentarlo!",
        });
    }
});
