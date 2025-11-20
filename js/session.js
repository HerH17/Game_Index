// js/session.js

// -----------------------------------------------------
// GESTIÓN DE SESIÓN Y AUTENTICACIÓN
// -----------------------------------------------------

/**
 * Verifica si el usuario está autenticado y redirige según corresponda
 */
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop(); 
    
    // Solo redirigir si NO tiene token y está en dashboard
    if (!token && currentPage === 'dashboard.html') {
        window.location.href = 'index.html';
    }
    
    // CORRECCIÓN: Permitir que usuarios logueados visiten el index
    // No redirigir automáticamente de index a dashboard
}

/**
 * Cierra la sesión del usuario
 */
function handleLogout(e) {
    if (e) e.preventDefault();
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    
    window.location.href = 'index.html';
}

/**
 * Actualiza la UI cuando el usuario está logueado
 * Funciona para Dashboard, Library y otras páginas protegidas
 */
function updateDashboardUI() {
    const storedUsername = localStorage.getItem('username');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que usan el header con usuario logueado
    const protectedPages = ['dashboard.html', 'library.html', 'reviews.html', 'games.html', 'reviews-public.html'];
    
    if (protectedPages.includes(currentPage) && storedUsername) {
        // Actualizar nombre de usuario en el header
        const usernameDisplay = document.getElementById('usernameDisplay');
        const loggedInGroup = document.getElementById('loggedInGroup');

        if (usernameDisplay) {
            usernameDisplay.textContent = storedUsername;
        }
        
        if (loggedInGroup) {
            loggedInGroup.classList.remove('hidden');
        }

        // Solo en dashboard: actualizar también el título principal
        if (currentPage === 'dashboard.html') {
            const welcomeUsername = document.getElementById('welcomeUsername');
            if (welcomeUsername) {
                welcomeUsername.textContent = storedUsername;
            }
        }
    }
}

// -----------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    checkAuthentication();
    
    // Actualizar UI del dashboard si corresponde
    updateDashboardUI();
    
    // Hacer funciones accesibles globalmente
    window.handleLogout = handleLogout;
});