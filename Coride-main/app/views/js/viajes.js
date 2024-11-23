let travelData;
let page = 0;
const travelsPerPage = 10; // Número de viajes por página

// Obtener el correo del usuario loggeado
const loggedUserEmail = sessionStorage.getItem('correo');

let xhr = new XMLHttpRequest();
xhr.open('GET', 'https://coride.site/travels');
xhr.setRequestHeader('Authorization', `Bearer ${sessionStorage.getItem('token') || ''}`);
xhr.send();

xhr.onload = function() {
    if (xhr.status === 200) {
        travelData = JSON.parse(xhr.responseText).filter(travel => travel.passengers.includes(loggedUserEmail));
        if (travelData.length > 0) {
            setupPagination(travelData.length, travelsPerPage);
            showTravels();
        } else {
            console.error("No hay viajes asociados a este usuario");
        }
    } else {
        console.error("No se pudo cargar los datos: ", xhr.status);
    }
};


    function redirectToPage() {
        window.location.href = 'detallesviaje.html';
    }




async function showTravels() {
    const tableBody = document.querySelector('#buscarViajesContainer .table-responsive table tbody');
    tableBody.innerHTML = ''; // Limpiar contenido anterior

    // Obtener subconjunto de datos basado en paginación
    const paginatedData = travelData.slice(page * travelsPerPage, (page + 1) * travelsPerPage);

    for (const travel of paginatedData) {
        // Llamar a la función que recupera el nombre del conductor basado en el correo
        const driverName = await fetchDriverNameByEmail(travel.driver);

        const row = document.createElement('tr');
        let btnClass = 'btn-success';
        let btnText = 'Detalles de viajes';

        if (travel.confirmed) {
            btnText = 'Detalles de viajes';
        } else if (travel.confirmed) {
            btnClass = 'btn-danger';
            btnText = 'Cancelar';
        }

      

       
        row.innerHTML = `
            <td>${travel.zone}</td>
            <td>${driverName}</td>
            <td>${travel.hour}</td>
            <td>${travel.days}</td>
            <td>
    <button class="btn btn-primary btn-sm text-uppercase" onclick="redirectToPage()">Detalles del viaje</button>
</td>

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
        // Check if data properties exist before accessing them
        if (data.nombre && data.apellidoP) {
            return `${data.nombre} ${data.apellidoP}`;
        } else {
            throw new Error('Invalid response structure');
        }
    })
    .catch(err => {
        console.error('Error fetching driver name', err);
        return email; // Return the email if the name fetch fails
    });
}





function toggleReservation(index, btn) {
    let travel = travelData[page * travelsPerPage + index];
    if (!travel || (travel.disponibility === 0 && !travel.confirmed)) {
        console.error('No se puede realizar la acción: viaje no disponible o ya confirmado.');
        return; // Asegura que el viaje exista y tenga lógica aplicable
    }

    const action = travel.confirmed ? 'cancel' : 'confirm';
    fetch(`https://coride.site/travels/${travel.uuid}/${action}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falló la comunicación con el servidor');
        }
        return response.json();
    })
    .then(updatedTravel => {
        travel.disponibility = updatedTravel.disponibility;
        travel.confirmed = !travel.confirmed;
        showTravels(); // Actualizar la tabla después de modificar la reserva
    })
    .catch(error => console.error('Error:', error));
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
