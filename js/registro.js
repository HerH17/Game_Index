// js/registro.js

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('form-registro');
    const registerModalElement = document.getElementById('registerModal');
    const successModalElement = document.getElementById('successModal');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener valores del formulario
            const username = document.getElementById('regUsernameInput').value.trim();
            const email = document.getElementById('regEmailInput').value.trim();
            const password = document.getElementById('regPasswordInput').value;
            const dobValue = document.getElementById('regDOBInput').value;
            const age = parseInt(document.getElementById('regAgeInput').value);

            // Validación básica
            if (!username || !email || !password || !dobValue || !age) {
                displayErrorModal('Por favor, completa todos los campos.');
                return;
            }

            if (age < 13) {
                displayErrorModal('Debes tener al menos 13 años para registrarte.');
                return;
            }

            // Preparar datos para enviar
            const dobDate = new Date(dobValue);
            const userData = {
                username,
                email,
                password,
                dob: dobDate.toISOString(),
                age
            };

            try {
                const response = await fetch('http://localhost:5000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Ocultar modal de registro
                    const registerModal = bootstrap.Modal.getInstance(registerModalElement);
                    if (registerModal) {
                        registerModal.hide();
                    }

                    // Limpiar formulario
                    registrationForm.reset();

                    // Mostrar modal de éxito
                    const successModal = new bootstrap.Modal(successModalElement);
                    successModal.show();

                } else {
                    // Mostrar error del servidor
                    displayErrorModal(data.message || 'Error al registrar usuario.');
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                displayErrorModal('No se pudo conectar al servidor. Asegúrate de que el backend esté ejecutándose.');
            }
        });
    }
});

/**
 * Muestra el modal genérico de error con un mensaje específico.
 * @param {string} message - El mensaje de error a mostrar.
 */
function displayErrorModal(message) {
    const errorModalElement = document.getElementById('errorModal');
    const errorMessageText = document.getElementById('errorMessageText');
    
    if (!errorModalElement || !errorMessageText) {
        console.error("No se encontraron elementos para el modal de error.");
        alert(message); // Fallback
        return;
    }
    
    // Inyectar el mensaje de error
    errorMessageText.textContent = message;
    
    // Mostrar el modal
    const errorModal = new bootstrap.Modal(errorModalElement);
    errorModal.show();
}