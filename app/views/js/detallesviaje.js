document.addEventListener('DOMContentLoaded', function() {
    fetchTravelAndDriverData();
});

function fetchTravelAndDriverData() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    fetch('/travels/travel-data', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(travelData => {
        const driverEmail = travelData[0].driver;
        return fetch(`/profile-name/${encodeURIComponent(driverEmail)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(driverProfile => {
            fillProfileForm(driverProfile, travelData[0]);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire({
            icon: "error",
            title: "Error al cargar los datos",
            text: "No se pudo cargar la información necesaria. Inténtalo de nuevo más tarde."
        });
    });
}

function fillProfileForm(driverProfile, travelData) {
    document.getElementById('nombreV').textContent = driverProfile.nombre || 'No disponible';
    document.getElementById('apellidoPV').textContent = driverProfile.apellidoP || 'No disponible';
    document.getElementById('apellidoMV').textContent = driverProfile.apellidoM || 'No disponible';
    document.getElementById('telefonoV').textContent = driverProfile.telefono || 'No disponible';
    document.getElementById('marcaV').textContent = driverProfile.marcaVehiculo || 'No disponible';
    document.getElementById('modeloV').textContent = driverProfile.modeloVehiculo || 'No disponible';
    document.getElementById('anoV').textContent = driverProfile.yearVehiculo || 'No disponible';
    document.getElementById('colorV').textContent = driverProfile.colorVehiculo || 'No disponible';
    document.getElementById('placaV').textContent = driverProfile.placa || 'No disponible';
    document.getElementById('zonaV').textContent = travelData.zone || 'No disponible';
    document.getElementById('horaV').textContent = travelData.hour || 'No disponible';
}
