// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('usernameInput'); 
    const passwordInput = document.getElementById('passwordInput');
    const loginModalElement = document.getElementById('loginModal');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const credentials = {
                username: usernameInput.value.trim(), 
                password: passwordInput.value
            };

            // Validación básica
            if (!credentials.username || !credentials.password) {
                displayErrorModal('Por favor, completa todos los campos.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                const data = await response.json();

                if (response.ok) {
                    // ÉXITO: Guardar token y username
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('username', data.username);
                    
                    // Ocultar el modal de login
                    const loginModal = bootstrap.Modal.getInstance(loginModalElement);
                    if (loginModal) {
                        loginModal.hide();
                    }

                    // Redirigir inmediatamente al dashboard (sin modal de éxito)
                    window.location.href = 'dashboard.html';

                } else {
                    // Manejo de errores del servidor
                    displayErrorModal(data.message || 'Credenciales inválidas');
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

/**
 * Muestra un modal específico
 * @param {string} modalId - ID del modal a mostrar
 */
function showModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.error(`Modal con ID '${modalId}' no encontrado.`);
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}