document.addEventListener('DOMContentLoaded', function() {
    fetchProfileData();
});

function fetchProfileData() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    fetch('/profile-data/' + sessionStorage.getItem("correo"), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        return response.json();
    }).then(data => {
        fillProfileForm(data);
    }).catch(error => {
        console.error('Error fetching profile data:', error);
        Swal.fire({
            icon: "error",
            title: "Error al cargar el perfil",
            text: "No se pudo cargar la información del perfil. Inténtalo de nuevo más tarde."
        });
    });
}

function fillProfileForm(data) {
    // Actualiza campos de texto simples
    document.getElementById('nombreI').textContent = data.nombre || 'No disponible';
    document.getElementById('apellidoPI').textContent = data.apellidoP || 'No disponible';
    document.getElementById('apellidoMI').textContent = data.apellidoM || 'No disponible';
    document.getElementById('edadI').textContent = data.edad == -1 ? 'Faltante': data.edad;
    document.getElementById('correoI').textContent = data.correo || 'No disponible';
    document.getElementById('telefonoI').textContent = data.telefono || 'Faltante';
    document.getElementById('carreraI').textContent = data.carrera || 'Faltante';

    // Actualiza información del vehículo
    document.getElementById('marcaVehiculoI').textContent = data.marcaVehiculo || 'Faltante';
    document.getElementById('modeloVehiculoI').textContent = data.modeloVehiculo || 'Faltante';
    document.getElementById('yearVehiculoI').textContent = data.yearVehiculo == -1 ? 'Faltante' : data.yearVehiculo;
    document.getElementById('colorVehiculoI').textContent = data.colorVehiculo || 'Faltante';
    document.getElementById('placaI').textContent = data.placa || 'Faltante ';
}

