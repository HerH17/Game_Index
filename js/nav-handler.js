// js/nav-handler.js
// Script para manejar la navegación en el index cuando el usuario está logueado

document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Solo ejecutar en index.html
    if ((currentPage === 'index.html' || currentPage === 'games.html' || currentPage === '') && storedUsername) {
        updateIndexNavigation(storedUsername);
    }
});

/**
 * Actualiza la navegación del index para usuarios logueados
 */
function updateIndexNavigation(username) {
    const navbarNav = document.getElementById('navbarNav');
    if (!navbarNav) return;

    const navList = navbarNav.querySelector('.navbar-nav');
    if (!navList) return;

    // Buscar y remover el botón de "Iniciar sesión"
    const loginButton = navList.querySelector('[data-bs-target="#loginModal"]');
    if (loginButton) {
        const loginItem = loginButton.closest('.nav-item');
        if (loginItem) {
            loginItem.remove();
        }
    }

    // Verificar si ya existen elementos de usuario (evitar duplicados)
    const existingUserElements = navList.querySelectorAll('[data-user-nav]');
    if (existingUserElements.length > 0) return;

    // Crear elemento de perfil (Dashboard)
    const profileItem = document.createElement('li');
    profileItem.className = 'nav-item ms-lg-3';
    profileItem.setAttribute('data-user-nav', 'true');
    profileItem.innerHTML = `
        <a href="dashboard.html" class="btn btn-neon btn-sm px-3 py-1 fw-bold text-uppercase d-flex align-items-center justify-content-center">
            <i class="fa-solid fa-user me-1"></i> ${username}
        </a>
    `;

    // Crear elemento de cerrar sesión
    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item';
    logoutItem.setAttribute('data-user-nav', 'true');
    logoutItem.innerHTML = `
        <a href="#" class="nav-link text-danger" id="logoutButtonIndex">
            Cerrar Sesión
        </a>
    `;

    // Agregar elementos al navbar
    navList.appendChild(profileItem);
    navList.appendChild(logoutItem);

    // Agregar event listener al botón de logout
    const logoutBtn = document.getElementById('logoutButtonIndex');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout(e);
        });
    }
}