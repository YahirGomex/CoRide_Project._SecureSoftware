// Asume que 'utils.js' está correctamente importado y accesible
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16 | 0;
        let v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
        });
       
}

const btnUnico = document.getElementById('btn-unico');
const btnRutina = document.getElementById('btn-rutina');
const formUnico = document.getElementById('unico-form');
const formRutina = document.getElementById('rutina-form');
const btnRegistrarViajes = document.getElementById('btn-registrar-viajes');

btnUnico.addEventListener('click', () => {
    formUnico.style.display = 'block'; // Muestra el formulario único
    formRutina.style.display = 'none';  // Oculta el formulario de rutina

    // Activar validación para formulario único
    document.getElementById('place-unico').required = true;
    document.getElementById('unique-time-unico').required = true;
    document.getElementById('routine-seats-unico').required = true;
    document.getElementById('unique-day-unico').required = true;

    // Desactivar validación para formulario de rutina
    document.getElementById('place-rutina').required = false;
    document.getElementById('unique-time-rutina').required = false;
    document.getElementById('routine-seats-rutina').required = false;
    

    btnRegistrarViajes.classList.remove('hidden');
});

btnRutina.addEventListener('click', () => {
    formRutina.style.display = 'block'; // Muestra el formulario de rutina
    formUnico.style.display = 'none';   // Oculta el formulario único

    // Activar validación para formulario de rutina
    document.getElementById('place-rutina').required = true;
    document.getElementById('unique-time-rutina').required = true;
    document.getElementById('routine-seats-rutina').required = true;
    


    // Desactivar validación para formulario único
    document.getElementById('place-unico').required = false;
    document.getElementById('unique-time-unico').required = false;
    document.getElementById('routine-seats-unico').required = false;
    document.getElementById('unique-day-unico').required = false;

    btnRegistrarViajes.classList.remove('hidden');
});

async function getUserEmail() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.log('No token found');
        return null;
    }

    try {
        const response = await fetch('/get-user-email', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.email;
        } else {
            const errorResponse = await response.json();
            console.error('Error al obtener el correo:', errorResponse.message);
            return null;
        }
    } catch (error) {
        console.error('Error en la conexión al servidor:', error);
        return null;
    }
}



document.getElementById('registrationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // const driverEmail = await getUserEmail();
    const driverEmail = sessionStorage.getItem("correo");
    if (!driverEmail) {
        alert('No se pudo obtener el correo del usuario. Asegúrese de estar logueado.');
        return;
    }

    const formIsActive = formUnico.style.display !== 'none' ? 'unico' : 'rutina';
    const zone = document.getElementById(`place-${formIsActive}`).value;
    const time = document.getElementById(`unique-time-${formIsActive}`).value;
    const seats = parseInt(document.getElementById(`routine-seats-${formIsActive}`).value, 10);

    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 28);  // 4 semanas después

    let travels = [];

    if (formIsActive === 'rutina') {
        const selectedDays = Array.from(document.querySelectorAll('input[name="routine-day"]:checked')).map(el => el.value.toLowerCase());
        
        for (let day of selectedDays) {
            for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
                if (dt.toLocaleDateString('es', { weekday: 'long' }).toLowerCase() === day) {
                    let travelDate = new Date(dt);
                    travels.push({
                        uuid: generateUUID(),
                        zone,
                        driver: driverEmail,
                        hour: time,
                        disponibility: seats,
                        days: travelDate.toLocaleDateString('en-CA'),  // Formato 'YYYY-MM-DD'
                        
                    });
                }
            }
            startDate = new Date();  // Reset start date after altering it in the loop
        }
    } else {
        travels.push({
            uuid: generateUUID(),
            zone,
            driver: driverEmail,
            hour: time,
            disponibility: seats,
            days: document.getElementById(`unique-day-${formIsActive}`).value,
            passengers: []
        });
    }

    try {
        const token = sessionStorage.getItem('token');
        const responses = await Promise.all(travels.map(travel => 
            fetch('/register-travel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(travel),
            })
        ));

        const allResponsesOk = responses.every(resp => resp.ok);
        if (allResponsesOk) {
            Swal.fire({
                icon: "success",
                title: "Se ha registrado el viaje con éxito",
                showConfirmButton: false,
                timer: 1500
                
            });
        } else {
            alert('Algunos viajes no se pudieron registrar. Verifique los errores en la consola.');
        }
    } catch (error) {
        console.error('Error al registrar viajes:', error);
        Swal.fire({
            icon: "error",
            title: "Error de autenticación",
            text: "Correo o contraseña incorrectos.",
        });
    }
});


