// Fade hero text on scroll
const heroTextContainer = document.getElementById('hero-text-container');
window.addEventListener('scroll', () => {
  const fadePoint = 120;
  const opacity = Math.max(0, 1 - window.scrollY / fadePoint);
  heroTextContainer.style.opacity = opacity;
});

// ------------------------------------------------------------------
// LÓGICA DE BÚSQUEDA
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Escucha la barra de búsqueda en el index
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchGames(searchInput.value.trim());
            }
        });
    }

    // Cargar juegos populares al inicio
    fetchPopularGames();

    // Event listeners para los modales
    setupModalListeners();
});

/**
 * Realiza la llamada a la API de búsqueda
 * @param {string} query - Término de búsqueda
 */
async function searchGames(query) {
    if (query.length < 2) {
        displayErrorModal('Por favor, ingresa al menos 2 caracteres para buscar.');
        return;
    }

    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="col-12 text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Buscando juegos para "${query}"...</p>
        </div>
    `;

    try {
        const response = await fetch(`http://localhost:5000/api/games/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Error al conectar con el servidor de juegos.');
        }

        const games = await response.json();
        renderGames(games, 'Resultados de Búsqueda', 'search-results-list');

    } catch (error) {
        console.error('Error en la búsqueda:', error);
        resultsContainer.innerHTML = `
            <div class="col-12 text-center my-5 text-danger">
                <i class="fa-solid fa-server fa-2x mb-3"></i>
                <p>Ocurrió un error al buscar los juegos. Verifica el backend.</p>
            </div>
        `;
    }
}

/**
 * Renderiza la lista de juegos en el contenedor principal
 * @param {Array} games - Lista de objetos de juego
 * @param {string} title - Título de la sección
 * @param {string} id - ID del contenedor de la fila
 */
function renderGames(games, title, id) {
    const mainContainer = document.getElementById('mainContent');
    if (!mainContainer) return;

    // Remover resultados anteriores de búsqueda (si existen)
    let searchContainer = document.getElementById('searchResults');
    if (searchContainer) {
        searchContainer.remove();
    }
    
    // Si no es la lista de juegos populares, agregar el nuevo contenedor
    if (id === 'search-results-list') {
        const newContainer = document.createElement('div');
        newContainer.className = 'container';
        newContainer.id = 'searchResults';
        newContainer.innerHTML = `
            <h2 class="section-title mt-5 mb-4">${title} (${games.length} resultados)</h2>
            <div id="${id}" class="row g-4"></div>
        `;
        mainContainer.prepend(newContainer); // Agrega antes del contenido existente
        searchContainer = document.getElementById(id);
    } else {
        // Para juegos populares
        searchContainer = document.getElementById(id);
        const titleElement = document.getElementById('popular-games-title');
        if (titleElement) titleElement.textContent = title;
        if (!searchContainer) return; // Si no existe, salir.
        searchContainer.innerHTML = ''; // Limpiar si ya existe
    }
    
    if (games.length === 0) {
        searchContainer.innerHTML = `
            <div class="col-12 text-center my-5 text-muted">
                <i class="fa-solid fa-gamepad fa-2x mb-3"></i>
                <p>No se encontraron juegos que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }

    games.forEach(game => {
        // Convertir la calificación de 1-10 a estrellas de 1-5
        const ratingStars = game.rating 
            ? '⭐'.repeat(Math.min(5, Math.ceil(game.rating / 2))) 
            : '';

        const gameCard = document.createElement('div');
        gameCard.className = 'col-6 col-md-4 col-lg-3 col-xl-2';
        gameCard.innerHTML = `
            <div class="game-card" data-igdb-id="${game.igdbId}">
                <img src="${game.coverUrl}" alt="${game.name} cover" class="img-fluid game-cover" loading="lazy" onerror="this.onerror=null; this.src='./img/no-cover.jpg';">
                <div class="game-info">
                    <p class="game-rating">${ratingStars}</p>
                    <h3 class="game-title">${game.name}</h3>
                </div>
            </div>
        `;
        searchContainer.appendChild(gameCard);

        // Añadir listener para abrir el modal
        gameCard.querySelector('.game-card').addEventListener('click', () => {
            fetchGameDetails(game.igdbId);
        });
    });
}

/**
 * Obtiene y renderiza los juegos populares
 */
async function fetchPopularGames() {
    const resultsContainer = document.getElementById('popular-games-list');
    if (!resultsContainer) return;
    
    // Mostrar spinner mientras carga
    resultsContainer.innerHTML = `
        <div class="col-12 text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando juegos populares...</p>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:5000/api/games/popular');
        
        if (!response.ok) {
             throw new Error('Error al conectar con el servidor de juegos populares.');
        }

        const games = await response.json();
        
        // Mapear los resultados de populares (necesario ya que la ruta /popular devuelve el objeto IGDB completo)
        const mappedGames = games.map(game => ({
            igdbId: game.id,
            name: game.name,
            coverUrl: igdbService.formatCoverUrl(game.cover?.image_id, 'cover_big'),
            releaseDate: game.first_release_date,
            genres: game.genres?.map(g => g.name) || [],
            rating: game.rating ? Math.round(game.rating) : null,
            summary: game.summary
        }));
        
        renderGames(mappedGames, 'Juegos Populares', 'popular-games-list');

    } catch (error) {
        console.error('Error al cargar juegos populares:', error);
        resultsContainer.innerHTML = `
            <div class="col-12 text-center my-5 text-danger">
                <i class="fa-solid fa-server fa-2x mb-3"></i>
                <p>Ocurrió un error al cargar los juegos populares. Verifica el backend.</p>
            </div>
        `;
    }
}


// ------------------------------------------------------------------
// LÓGICA DEL MODAL DE DETALLES DEL JUEGO
// ------------------------------------------------------------------

/**
 * Obtiene los detalles de un juego específico
 * @param {number} gameId - ID del juego en IGDB
 */
async function fetchGameDetails(gameId) {
    const modalBody = document.getElementById('gameDetailsBody');
    const modalTitle = document.getElementById('gameDetailsLabel');
    const modalFooter = document.getElementById('gameDetailsFooter');
    
    // Mostrar spinner
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Cargando detalles del juego...</p>
            </div>
        `;
    }
    if (modalTitle) modalTitle.textContent = 'Cargando...';
    if (modalFooter) modalFooter.innerHTML = '';
    
    // Mostrar modal
    const gameDetailsModal = new bootstrap.Modal(document.getElementById('gameDetailsModal'));
    gameDetailsModal.show();

    try {
        const token = localStorage.getItem('authToken');
        
        // La ruta pide authMiddleware, por lo que se envía el token
        const response = await fetch(`http://localhost:5000/api/games/${gameId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar detalles del juego.');
        }

        const game = await response.json();
        
        renderGameDetailsModal(game);

    } catch (error) {
        console.error('Error al obtener detalles del juego:', error);
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="text-center my-5 text-danger">
                    <i class="fa-solid fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>No se pudo cargar la información del juego. (${error.message})</p>
                </div>
            `;
        }
    }
}

/**
 * Renderiza los detalles de un juego en el modal
 * @param {Object} game - Objeto de datos del juego
 */
function renderGameDetailsModal(game) {
    const modalBody = document.getElementById('gameDetailsBody');
    const modalTitle = document.getElementById('gameDetailsLabel');
    const modalFooter = document.getElementById('gameDetailsFooter');

    if (!modalBody || !modalTitle || !modalFooter) return;

    // Establecer el título
    modalTitle.textContent = game.name;

    // 1. URL de la portada (con corrección de fallback)
    let coverUrl = game.cover ? game.cover : null;
    // ✅ CORRECCIÓN APLICADA: Usar la ruta absoluta en el frontend
    coverUrl = coverUrl || `/img/no-cover.jpg`; 

    // 2. Otros datos
    const releaseYear = game.releaseDate 
        ? new Date(game.releaseDate * 1000).getFullYear() 
        : 'N/A';
    
    const genres = game.genres?.map(g => g.name).join(', ') || 'N/A';
    const platforms = game.platforms?.map(p => p.name).join(', ') || 'N/A';
    const developers = game.developers.join(', ') || 'N/A';
    const ratingStars = game.rating 
        ? '⭐'.repeat(Math.min(5, Math.ceil(game.rating / 2))) + ` (${Math.round(game.rating)})`
        : 'N/A';

    // 3. Renderizar el cuerpo del modal
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-4 text-center">
                <img src="${coverUrl}" alt="${game.name}" class="img-fluid rounded shadow game-details-cover" onerror="this.onerror=null; this.src='/img/no-cover.jpg';">
                
                <p class="mt-3 fs-5 mb-1" style="color: #ffc107;">${ratingStars}</p>
                
                <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
                    <span class="badge bg-primary">${game.trackerStatus || 'No Rastreado'}</span>
                    ${game.trackerRating ? `<span class="badge bg-secondary">Mi Nota: ${game.trackerRating}/10</span>` : ''}
                </div>
            </div>
            <div class="col-md-8">
                <h4 class="text-white mt-3 mt-md-0">${game.name}</h4>
                <p class="text-muted small mb-3">Lanzamiento: ${releaseYear} | Desarrollador: ${developers}</p>
                
                <p class="summary-text">${game.summary || 'No hay un resumen disponible.'}</p>
                
                <h6 class="text-primary mt-4">Información Detallada</h6>
                <ul class="list-unstyled detail-list">
                    <li><strong>Géneros:</strong> ${genres}</li>
                    <li><strong>Plataformas:</strong> ${platforms}</li>
                    ${game.storyline ? `<li><strong>Argumento:</strong> ${game.storyline}</li>` : ''}
                </ul>
                
                ${game.screenshots?.length > 0 ? `
                    <h6 class="text-primary mt-4">Capturas de Pantalla</h6>
                    <div class="screenshot-gallery">
                        ${game.screenshots.slice(0, 3).map(url => `
                            <img src="${url.replace('t_thumb', 't_screenshot_med')}" class="img-thumbnail" loading="lazy">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // 4. Renderizar el footer
    const trackingButton = game.isTracked
        ? `<button type="button" class="btn btn-danger" id="untrackButton" data-igdb-id="${game.id}">Dejar de Seguir</button>`
        : `<button type="button" class="btn btn-neon" id="trackButton" data-igdb-id="${game.id}" data-game-name="${game.name}" data-cover-url="${coverUrl}">Rastrear Juego</button>`;
    
    modalFooter.innerHTML = `
        ${trackingButton}
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
    `;

    // 5. Asignar Event Listeners al footer
    const trackButton = document.getElementById('trackButton');
    const untrackButton = document.getElementById('untrackButton');
    
    if (trackButton) {
        trackButton.addEventListener('click', () => {
            handleTrackGameClick(game);
        });
    }

    if (untrackButton) {
        untrackButton.addEventListener('click', () => {
            handleUntrackGameClick(game.id, game.name);
        });
    }
}

/**
 * Maneja el clic en el botón Rastrear Juego
 */
function handleTrackGameClick(game) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        displayErrorModal('Debes iniciar sesión para rastrear juegos.');
        return;
    }
    
    // Ocultar modal de detalles
    const gameDetailsModal = bootstrap.Modal.getInstance(document.getElementById('gameDetailsModal'));
    gameDetailsModal.hide();

    // Establecer valores iniciales para el modal de edición/seguimiento
    document.getElementById('editIgdbId').value = game.id;
    document.getElementById('editGameName').value = game.name;
    document.getElementById('editCoverUrl').value = game.cover || '/img/no-cover.jpg'; // Usar la URL que ya calculamos
    document.getElementById('editStatus').value = 'Pendiente';
    document.getElementById('editPlatform').value = 'PC';
    document.getElementById('editRating').value = '';
    document.getElementById('editHours').value = 0;
    document.getElementById('editNotes').value = '';
    
    // Mostrar modal de edición/seguimiento
    const editModal = new bootstrap.Modal(document.getElementById('editTrackerModal'));
    editModal.show();
}

/**
 * Maneja el envío del formulario de rastreo (Guardar Cambios)
 */
async function handleTrackerSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
        displayErrorModal('Sesión expirada. Por favor, inicia sesión de nuevo.');
        return;
    }

    const editForm = document.getElementById('editTrackerForm');
    const igdbId = parseInt(document.getElementById('editIgdbId').value);
    
    const trackerData = {
        igdbId: igdbId,
        gameName: document.getElementById('editGameName').value,
        coverUrl: document.getElementById('editCoverUrl').value,
        status: document.getElementById('editStatus').value,
        platform: document.getElementById('editPlatform').value,
        userRating: document.getElementById('editRating').value,
        hoursPlayed: document.getElementById('editHours').value,
        notes: document.getElementById('editNotes').value,
    };
    
    // Validación de campos
    if (!trackerData.igdbId || !trackerData.gameName || !trackerData.status) {
        displayErrorModal('Faltan datos críticos del juego.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/games/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(trackerData)
        });

        const data = await response.json();

        if (response.ok) {
            // Éxito: Cerrar el modal y mostrar el mensaje
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editTrackerModal'));
            editModal.hide();
            
            // Reabrir el modal de detalles con la info actualizada
            fetchGameDetails(igdbId);
            
        } else {
            displayErrorModal(data.message || 'Error al guardar el seguimiento.');
        }

    } catch (error) {
        console.error('Error al enviar el formulario de rastreo:', error);
        displayErrorModal('No se pudo conectar con el servidor.');
    }
}

/**
 * Maneja el clic en el botón Dejar de Seguir
 */
async function handleUntrackGameClick(gameId, gameName) {
    if (!confirm(`¿Estás seguro de que quieres dejar de seguir a "${gameName}"?`)) {
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        displayErrorModal('Sesión expirada. Por favor, inicia sesión de nuevo.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/games/untrack/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Éxito: Cerrar el modal y mostrar el mensaje
            const gameDetailsModal = bootstrap.Modal.getInstance(document.getElementById('gameDetailsModal'));
            gameDetailsModal.hide();
            
            alert(`"${gameName}" eliminado de tu biblioteca.`);
            
            // Opcional: Recargar el index o mostrar un mensaje de éxito.
            fetchPopularGames();

        } else {
            displayErrorModal(data.message || 'Error al eliminar el seguimiento.');
        }
    } catch (error) {
        console.error('Error al dejar de seguir el juego:', error);
        displayErrorModal('No se pudo conectar con el servidor.');
    }
}

/**
 * Configura los event listeners para los modales de formulario
 */
function setupModalListeners() {
    const editTrackerModal = document.getElementById('editTrackerModal');
    const editTrackerForm = document.getElementById('editTrackerForm');

    if (editTrackerForm) {
        editTrackerForm.addEventListener('submit', handleTrackerSubmit);
    }

    // Limpiar el formulario al cerrar el modal
    if (editTrackerModal) {
        editTrackerModal.addEventListener('hidden.bs.modal', () => {
            if (editTrackerForm) editTrackerForm.reset();
        });
    }
}

// js/script.js (Añadir al final del archivo)
// ... otras funciones de script.js ...

/**
 * Muestra el modal genérico de error con un mensaje específico.
 * @param {string} message - El mensaje de error a mostrar.
 */
function displayErrorModal(message) {
    const errorModalElement = document.getElementById('errorModal');
    const errorMessageText = document.getElementById('errorMessageText');

    if (!errorModalElement || !errorMessageText) {
        console.error("No se encontraron elementos para el modal de error.");
        return;
    }
    
    // 1. Inyectar el mensaje de error
    errorMessageText.textContent = message;

    // 2. Mostrar el modal
    const errorModal = new bootstrap.Modal(errorModalElement);
    errorModal.show();
}