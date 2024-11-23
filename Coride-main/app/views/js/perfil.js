function updateProfile() {
    const form = document.getElementById('updateForm');
    const formData = new FormData(form);
    const updates = {};
    formData.forEach((value, key) => {
        updates[key] = value;
    });

    fetch('/update-profile/' + sessionStorage.getItem("correo"), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
    }).then(response => response.json())
    .then(data => {
        Swal.fire({
            icon: "success",
            title: "Se han actualizado tus datos correctamente",
            showConfirmButton: false,
            timer: 1500
        });
        setTimeout(() => {
            window.location.href = '/perfil'; // Cambia a la nueva URL después de 5 segundos.
        }, 900);
    })
    .catch((error) => {
        Swal.fire({
            icon: "error",
            title: "Error al actualizar",
            text: error.message || "Verifica que no haya algo mal y vuelve a intentarlo!",
        });
    });
}