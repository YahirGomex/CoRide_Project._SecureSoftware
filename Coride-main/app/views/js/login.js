const correoInput = document.getElementById('correo');
const passInput = document.getElementById('contraseña');
const actionLogin = document.getElementById('entrar');

actionLogin.addEventListener('click', async (event) => {
    event.preventDefault();  // Previene el comportamiento predeterminado del formulario.
    try {
        let correo = correoInput.value;
        let password = passInput.value;

        if (correo === "" || password === "") {
            Swal.fire({
                icon: "error",
                title: "Campos vacíos",
                text: "Correo y contraseña son requeridos.",
            });
        } else {
            const credentials = { correo, password };

            const requestBody = JSON.stringify(credentials);

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (response.ok) {
                const token = await response.json();
                document.cookie = `token=${token};`;
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('correo', correo);
                // Redirección al index o donde sea necesario
                window.location.href = '/home';
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error de autenticación",
                    text: "Correo o contraseña incorrectos.",
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: "error",
            title: "Error del sistema",
            text: "Un problema ha ocurrido durante el inicio de sesión.",
        });
    }
});
