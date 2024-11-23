let travelData = [];
let page = 0;
const travelsPerPage = 10; // Número de viajes por página

// Obtener viajes iniciales
function fetchAllTravels() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://coride.site/travels');
    xhr.setRequestHeader('Authorization', `Bearer ${sessionStorage.getItem('token') || ''}`);
    xhr.send();

    xhr.onload = function() {
        if (xhr.status === 200) {
            travelData = JSON.parse(xhr.responseText);
            filterFutureTravels();
            page = 0; // Resetear la paginación
            showTravels();
            setupPagination(travelData.length, travelsPerPage);
        } else {
            console.error("No se pudo cargar los datos: ", xhr.status);
        }
    };
}

function filterFutureTravels() {
    const today = new Date();
    travelData = travelData.filter(travel => {
        const travelDate = new Date(travel.days); // Asumiendo que `travel.days` es una fecha en formato ISO
        return travelDate >= today;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAllTravels(); // Cargar viajes al cargar la página

    document.getElementById('button-addon2').addEventListener('click', function() {
        const searchValue = document.getElementById('searchInput').value;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://coride.site/travels?zone=${encodeURIComponent(searchValue)}`);
        xhr.setRequestHeader('Authorization', `Bearer ${sessionStorage.getItem('token') || ''}`);
        xhr.send();

        xhr.onload = function() {
            if (xhr.status === 200) {
                travelData = JSON.parse(xhr.responseText);
                filterFutureTravels();
                page = 0; // Resetear la paginación
                showTravels();
                setupPagination(travelData.length, travelsPerPage);
            } else {
                console.error("No se pudo cargar los datos: ", xhr.status);
            }
        };
    });
});

async function showTravels() {
    const correo = sessionStorage.getItem('correo');
    const tableBody = document.querySelector('#buscarViajesContainer .table-responsive table tbody');
    tableBody.innerHTML = ''; // Limpiar contenido anterior

    // Obtener subconjunto de datos basado en paginación
    const paginatedData = travelData.slice(page * travelsPerPage, (page + 1) * travelsPerPage);

    for (const travel of paginatedData) {
        const driverName = await fetchDriverNameByEmail(travel.driver);

        const row = document.createElement('tr');
        let btnClass = 'btn-success';
        let btnText = 'Confirmar';
        let isDisabled = '';

        if (travel.disponibility === 0) {
            btnClass = 'btn-secondary disabled'; // Botón gris y deshabilitado
            btnText = 'Lleno';
        } else if (travel.passengers.includes(correo)) {
            btnClass = 'btn-danger';
            btnText = 'Cancelar';
        } else if (travel.driver === correo) {
            btnClass = 'btn-secondary disabled'; // Botón gris y deshabilitado
            btnText = 'Propio';
            isDisabled = ' disabled';
        }

        row.innerHTML = `
            <td>${travel.zone}</td>
            <td>${driverName}</td>
            <td>${travel.hour}</td>
            <td>${travel.days}</td>
            <td>${travel.disponibility} Asientos</td>
            <td><button class="btn ${btnClass}${isDisabled}" onclick="toggleReservation('${travel.uuid}', this)">${btnText}</button></td>
        `;
        tableBody.appendChild(row);
    }
}

async function fetchDriverNameByEmail(email) {
    return fetch(`/profile-name/${encodeURIComponent(email)}`, {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, text: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.nombre && data.apellidoP) {
            return `${data.nombre} ${data.apellidoP}`;
        } else {
            throw new Error('Invalid response structure');
        }
    })
    .catch(err => {
        console.error('Error fetching driver name', err);
        return email; // Devuelve el correo electrónico si la obtención del nombre falla
    });
}

function toggleReservation(uuid, btn) {
    const token = sessionStorage.getItem('token');
    const correo = sessionStorage.getItem('correo'); // Obtener el correo directamente del sessionStorage
    const travel = travelData.find(t => t.uuid === uuid);

    if (!travel) {
        console.error('No se puede realizar la acción: viaje no disponible.');
        return;
    }

    if (travel.driver === correo) {
        console.error('El conductor no puede confirmar su propio viaje.');
        return;
    }

    if (travel.disponibility === 0 && !travel.passengers.includes(correo)) {
        console.error('No se puede realizar la acción: viaje lleno.');
        return;
    }

    const alreadyConfirmed = travel.passengers.includes(correo);
    const action = alreadyConfirmed ? 'cancel' : 'confirm';

    fetch(`https://coride.site/travels/${uuid}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ correo })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(updatedTravel => {
        travel.disponibility = updatedTravel.disponibility;
        travel.passengers = updatedTravel.passengers;

        btn.textContent = updatedTravel.passengers.includes(correo) ? 'Cancelar' : 'Confirmar';
        btn.className = updatedTravel.passengers.includes(correo) ? 'btn btn-danger' : 'btn btn-success';

        if (updatedTravel.disponibility === 0) {
            btn.className += ' disabled';
            btn.textContent = 'Lleno';
        }

        const disponibilityCell = btn.parentNode.previousElementSibling;
        disponibilityCell.textContent = `${updatedTravel.disponibility} Asientos`;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function setupPagination(totalItems, itemsPerPage) {
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('#pagination');
    let paginationHTML = ' ';
    for (let i = 0; i < pageCount; i++) {
        paginationHTML += `<button class="btn btn-secondary" style="margin-right: 5px;" onclick="changePage(${i})">${i + 1}</button>`;
    }
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(newPage) {
    page = newPage;
    showTravels();
}
