// js/library.js - VERSIÓN COMPLETA CORREGIDA

const API_URL = 'http://localhost:5000/api';
let currentFilter = 'all';
let allGames = [];

// ========================================
<<<<<<< HEAD
// UTILIDAD: Manejar imágenes faltantes
// ========================================

/**
 * Obtiene URL de portada válida o placeholder
 * @param {string} coverUrl - URL original de la portada
 * @returns {string} - URL válida o placeholder
 */
function getValidCoverUrl(coverUrl) {
    // Si no hay URL, usar placeholder
    if (!coverUrl || coverUrl === 'null' || coverUrl === 'undefined') {
        return 'https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';
    }
    
    // Si la URL es relativa y no existe, usar placeholder
    if (coverUrl.startsWith('/img/no-cover.jpg')) {
        return 'https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';
    }
    
    return coverUrl;
}

/**
 * Handler para imágenes que fallan al cargar
 * Agregar esto al onerror de todas las imágenes
 */
function handleImageError(imgElement) {
    imgElement.onerror = null; // Prevenir loop infinito
    imgElement.src = 'https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';
}

// ========================================
=======
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    loadUserLibrary();
    setupEventListeners();
});

// ========================================
// CARGAR BIBLIOTECA
// ========================================

async function loadUserLibrary() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/games/library`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar biblioteca');
        }

        const data = await response.json();
        allGames = data.entries;
        
        renderGames(allGames);

    } catch (error) {
        console.error('Error:', error);
        showError('No se pudo cargar tu biblioteca');
    }
}

// ========================================
// RENDERIZAR JUEGOS
// ========================================

function renderGames(games) {
    const grid = document.getElementById('gamesGrid');
    
    if (games.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No tienes juegos en tu biblioteca. ¡Agrega tu primer juego!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = games.map(game => {
<<<<<<< HEAD
        // ✅ FIX: Usar función para validar portada
        const coverImage = getValidCoverUrl(game.coverUrl);
=======
        const coverImage = game.coverUrl || '/img/no-cover.jpg';
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
        const stars = game.userRating ? '⭐'.repeat(Math.min(5, Math.ceil(game.userRating / 2))) : '';
        const hoursText = game.hoursPlayed > 0 ? `${game.hoursPlayed}h` : '0h';

        return `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card bg-dark text-white h-100">
                <img src="${coverImage}" 
                     class="card-img-top" 
                     alt="${game.gameName}"
                     style="height: 380px; object-fit: contain; object-position: center; background-color: #1a1a1a;"
<<<<<<< HEAD
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';">
=======
                     onerror="this.onerror=null; this.src='/img/no-cover.jpg';">
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                
                <div class="card-body d-flex flex-column p-3">
                    <h6 class="card-title mb-3 fw-bold text-center" style="color: #ffffff; font-size: 1.1rem;">${game.gameName}</h6>
                    
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <div class="text-start">
                                <small class="d-block mb-1" style="color: #ffffff;">
                                    <strong>Horas jugadas:</strong>
                                </small>
                                <small style="color: #cccccc;">
                                    <i class="far fa-clock me-1"></i>${hoursText}
                                </small>
                            </div>
                        </div>
                        
                        <div class="col-6">
                            <div class="text-start">
                                <small class="d-block mb-1" style="color: #ffffff;">
                                    <strong>Plataforma:</strong>
                                </small>
                                <small style="color: #cccccc;">
                                    <i class="fas fa-gamepad me-1"></i>${game.platform}
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3 text-center">
                        <small class="d-block mb-2" style="color: #ffffff;">
                            <strong>Calificación:</strong>
                        </small>
                        <div class="text-warning" style="font-size: 1.5rem; letter-spacing: 2px;">
                            ${stars || '<span class="small" style="color: #999999;">Sin calificar</span>'}
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <span class="badge ${getStatusBadgeClass(game.status)} w-100 py-2" style="font-size: 0.9rem;">
                            ${game.status}
                        </span>
                    </div>
                    
                    <div class="mt-auto d-flex flex-column gap-2">
                        <button class="btn btn-sm btn-outline-light w-100 py-2" 
                                onclick="openDetailModal('${game._id}')"
                                style="border-width: 2px;">
                            <i class="fas fa-star me-2"></i>Reseña
                        </button>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-grow-1 py-2" 
                                    onclick="openEditModal('${game._id}')"
                                    style="border-width: 2px;">
                                <i class="fas fa-edit me-1"></i>Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger py-2 px-3" 
                                    onclick="deleteGame('${game._id}', '${game.gameName.replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        'Completado': 'bg-success',
        'Jugando': 'bg-primary',
        'Pendiente': 'bg-warning text-dark',
        'Abandonado': 'bg-danger',
        'Deseado': 'bg-info'
    };
    return statusClasses[status] || 'bg-secondary';
}

// ========================================
<<<<<<< HEAD
// SISTEMA DE FILTROS AVANZADOS
// ========================================

let currentFilters = {
    status: 'all',
    platform: 'all',
    sortBy: 'recent'
};

=======
// BÚSQUEDA DE JUEGOS (IGDB)
// ========================================

>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
let searchTimeout;

function setupEventListeners() {
    const searchInput = document.getElementById('gameSearchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                document.getElementById('searchResults').innerHTML = `
<<<<<<< HEAD
                    <div class="col-12 text-center text-light">
=======
                    <div class="col-12 text-center text-muted">
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                        <p>Escribe al menos 2 caracteres para buscar...</p>
                    </div>
                `;
                return;
            }

            searchTimeout = setTimeout(() => searchGames(query), 500);
        });
    }

<<<<<<< HEAD
    // ✅ NUEVO: Filtros por estado
    document.querySelectorAll('[data-filter-status]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
            e.target.closest('button').classList.add('active');
            
            currentFilters.status = e.target.closest('button').dataset.filterStatus;
            applyFilters();
        });
    });

    // ✅ NUEVO: Filtro por plataforma
    const platformFilter = document.getElementById('platformFilter');
    if (platformFilter) {
        platformFilter.addEventListener('change', (e) => {
            currentFilters.platform = e.target.value;
            applyFilters();
        });
    }

    // ✅ NUEVO: Ordenamiento
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            applyFilters();
        });
    }

    // ✅ NUEVO: Limpiar filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentFilters = {
                status: 'all',
                platform: 'all',
                sortBy: 'recent'
            };
            
            // Resetear UI
            document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter-status="all"]').classList.add('active');
            
            if (platformFilter) platformFilter.value = 'all';
            if (sortBy) sortBy.value = 'recent';
            
            applyFilters();
        });
    }

=======
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.dataset.filter;
            currentFilter = filter;
            
            const filtered = filter === 'all' 
                ? allGames 
                : allGames.filter(g => g.status === filter);
            
            renderGames(filtered);
        });
    });

>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
    const editForm = document.getElementById('editGameForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateGame();
        });
    }
}

<<<<<<< HEAD
// ========================================
// APLICAR FILTROS
// ========================================

function applyFilters() {
    let filteredGames = [...allGames];

    // Filtrar por estado
    if (currentFilters.status !== 'all') {
        filteredGames = filteredGames.filter(g => g.status === currentFilters.status);
    }

    // Filtrar por plataforma
    if (currentFilters.platform !== 'all') {
        filteredGames = filteredGames.filter(g => g.platform === currentFilters.platform);
    }

    // Ordenar
    switch (currentFilters.sortBy) {
        case 'name':
            filteredGames.sort((a, b) => a.gameName.localeCompare(b.gameName));
            break;
        case 'rating':
            filteredGames.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
            break;
        case 'hours':
            filteredGames.sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0));
            break;
        case 'recent':
        default:
            filteredGames.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            break;
    }

    // Actualizar contador
    updateFilterCount(filteredGames.length, allGames.length);

    renderGames(filteredGames);
}

function updateFilterCount(filtered, total) {
    const filterCount = document.getElementById('filterCount');
    if (filterCount) {
        if (filtered === total) {
            filterCount.textContent = `Mostrando ${total} juegos`;
        } else {
            filterCount.textContent = `Mostrando ${filtered} de ${total} juegos`;
        }
    }
}

// ========================================
// BÚSQUEDA DE JUEGOS (IGDB)
// ========================================

=======
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
async function searchGames(query) {
    const resultsContainer = document.getElementById('searchResults');
    
    resultsContainer.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-light" role="status"></div>
            <p class="mt-2 text-white">Buscando juegos...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/games/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) throw new Error('Error en búsqueda');

        const data = await response.json();
        
        if (data.games.length === 0) {
            resultsContainer.innerHTML = `
<<<<<<< HEAD
                <div class="col-12 text-center text-light">
=======
                <div class="col-12 text-center text-muted">
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                    <p>No se encontraron juegos. Intenta con otro término.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = data.games.map(game => {
<<<<<<< HEAD
            // ✅ FIX: Usar getValidCoverUrl() aquí también
            const coverImage = getValidCoverUrl(game.cover);
=======
            const coverImage = game.cover || '/img/no-cover.jpg';
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
            const safeName = game.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeCover = coverImage.replace(/'/g, "\\'");

            return `
            <div class="col-md-6">
                <div class="card bg-dark mb-2">
                    <div class="row g-0">
                        <div class="col-4">
                            <img src="${coverImage}" 
                                 class="img-fluid rounded-start" 
                                 alt="${safeName}"
                                 style="height: 150px; object-fit: cover; width: 100%; background-color: #1a1a1a;"
<<<<<<< HEAD
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/150x150/1a1a2e/00d4ff?text=Sin+Portada';">
=======
                                 onerror="this.onerror=null; this.src='/img/no-cover.jpg';">
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                        </div>
                        <div class="col-8">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-1" style="color: #ffffff;">${game.name}</h6>
                                <p class="small mb-1" style="color: #cccccc;">
                                    ${game.genres?.slice(0, 2).join(', ') || 'Sin género'}
                                </p>
                                ${game.rating ? `<p class="small mb-1 text-warning">⭐ ${game.rating}/100</p>` : ''}
                                <button class="btn btn-sm btn-neon mt-1" 
                                        onclick="addGameToLibrary(${game.id}, '${safeName}', '${safeCover}')">
                                    <i class="fas fa-plus me-1"></i> Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                <p>Error al buscar juegos. Intenta nuevamente.</p>
            </div>
        `;
    }
}

// ========================================
// ✅ AGREGAR JUEGO - CON MODAL PRIMERO
// ========================================

function addGameToLibrary(igdbId, gameName, coverUrl) {
    // NO agregar inmediatamente, abrir modal primero
    openAddGameModal(igdbId, gameName, coverUrl);
}

<<<<<<< HEAD
// ========================================
// MODAL AGREGAR JUEGO MEJORADO ✨
// ========================================

function openAddGameModal(igdbId, gameName, coverUrl) {
    // ✅ FIX: Validar coverUrl antes de usar
    const validCoverUrl = getValidCoverUrl(coverUrl);
    
    const modalHTML = `
        <div class="modal fade" id="addGameDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #0f3460;">
                    <div class="modal-header border-0 pb-2">
                        <h5 class="modal-title fw-bold" style="color: #00d4ff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);">
                            <i class="fas fa-plus-circle me-2"></i>${gameName}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body pt-2">
                        <div class="row g-4">
                            <!-- Columna Izquierda -->
                            <div class="col-md-4">
                                <img src="${validCoverUrl}" 
                                     class="img-fluid rounded shadow-lg mb-3" 
                                     alt="${gameName}"
                                     style="width: 100%; object-fit: contain; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border: 2px solid #00d4ff;"
                                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';">
                                
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-flag-checkered me-2"></i>Estado del juego
                                    </label>
                                    <select class="form-select custom-input" id="addStatus" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #00d4ff; color: #ffffff;">
=======
function openAddGameModal(igdbId, gameName, coverUrl) {
    const modalHTML = `
        <div class="modal fade" id="addGameDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content custom-modal-bg">
                    <div class="modal-header border-0">
                        <h5 class="modal-title" style="color: #ffffff;">${gameName}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="${coverUrl || '/img/no-cover.jpg'}" 
                                     class="img-fluid rounded mb-3" 
                                     alt="${gameName}"
                                     style="width: 100%; object-fit: contain; background-color: #1a1a1a;"
                                     onerror="this.onerror=null; this.src='/img/no-cover.jpg';">
                                
                                <div class="mb-3">
                                    <label class="form-label" style="color: #ffffff;">Estado del juego:</label>
                                    <select class="form-select custom-input" id="addStatus">
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                                        <option value="Pendiente" selected>⏸ Pendiente</option>
                                        <option value="Jugando">▶ En progreso</option>
                                        <option value="Completado">✓ Completado</option>
                                        <option value="Abandonado">✗ Sin terminar</option>
                                        <option value="Deseado">★ Deseado</option>
                                    </select>
                                </div>
                            </div>
                            
<<<<<<< HEAD
                            <!-- Columna Derecha -->
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="far fa-clock me-2"></i>Horas jugadas
                                    </label>
                                    <input type="number" class="form-control custom-input" 
                                           id="addHours" value="0" min="0" step="0.5"
                                           style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460; color: #ffffff;">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-gamepad me-2"></i>Plataforma
                                    </label>
                                    <select class="form-select custom-input" id="addPlatform" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460; color: #ffffff;">
                                        <option value="PC" selected>PC</option>
                                        <option value="PlayStation 5">PlayStation 5</option>
                                        <option value="PlayStation 4">PlayStation 4</option>
                                        <option value="Xbox Series X/S">Xbox Series X/S</option>
                                        <option value="Xbox One">Xbox One</option>
=======
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label class="form-label" style="color: #ffffff;">Horas jugadas:</label>
                                    <input type="number" class="form-control custom-input" 
                                           id="addHours" value="0" min="0" step="0.5">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label" style="color: #ffffff;">Plataforma:</label>
                                    <select class="form-select custom-input" id="addPlatform">
                                        <option value="PC" selected>PC</option>
                                        <option value="PlayStation 5">PlayStation 5</option>
                                        <option value="Xbox Series X/S">Xbox Series X/S</option>
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                                        <option value="Nintendo Switch">Nintendo Switch</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
<<<<<<< HEAD
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-star me-2"></i>Calificación (1-5 estrellas)
                                    </label>
                                    <div class="p-3 rounded text-center" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460;">
                                        <div class="star-rating" id="addStarRating">
                                            ${[1, 2, 3, 4, 5].map(star => `
                                                <span class="star" data-rating="${star}" 
                                                      onclick="setAddRating(${star})"
                                                      style="cursor: pointer; font-size: 2.5rem; color: #444; transition: all 0.2s;">★</span>
                                            `).join('')}
                                        </div>
                                        <small class="text-light mt-2 d-block">Haz clic en una estrella para calificar</small>
=======
                                    <label class="form-label" style="color: #ffffff;">Calificación (1-5 estrellas):</label>
                                    <div class="star-rating" id="addStarRating">
                                        ${[1, 2, 3, 4, 5].map(star => `
                                            <span class="star" data-rating="${star}" 
                                                  onclick="setAddRating(${star})"
                                                  style="cursor: pointer; font-size: 2rem; color: #6c757d;">★</span>
                                        `).join('')}
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                                    </div>
                                    <input type="hidden" id="addRating" value="0">
                                </div>
                                
                                <div class="mb-3">
<<<<<<< HEAD
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-comment-dots me-2"></i>Reseña
                                    </label>
                                    <textarea class="form-control custom-input" id="addReview" rows="5" 
                                              placeholder="Escribe tu reseña aquí... ¿Qué te pareció el juego?"
                                              style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460; color: #ffffff; resize: none;"></textarea>
                                    <small class="text-light">Comparte tu experiencia con este juego</small>
=======
                                    <label class="form-label" style="color: #ffffff;">Reseña:</label>
                                    <textarea class="form-control custom-input" id="addReview" rows="5" 
                                              placeholder="Escribe tu reseña aquí..."></textarea>
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                                </div>
                            </div>
                        </div>
                        
<<<<<<< HEAD
                        <div class="d-flex gap-3 mt-4">
                            <button type="button" class="btn btn-outline-light flex-grow-1 py-2" data-bs-dismiss="modal" style="border-width: 2px;">
                                <i class="fas fa-times me-2"></i>Cancelar
                            </button>
                            <button type="button" class="btn btn-neon flex-grow-1 py-2" 
                                    onclick="confirmAddGame(${igdbId}, '${gameName.replace(/'/g, "\\'")}', '${validCoverUrl.replace(/'/g, "\\'")}')">
                                <i class="fas fa-check me-2"></i>Añadir a Mi Biblioteca
                            </button>
=======
                        <div class="d-flex gap-2 mt-3">
                            <button type="button" class="btn btn-secondary flex-grow-1" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-neon flex-grow-1" 
                                    onclick="confirmAddGame(${igdbId}, '${gameName.replace(/'/g, "\\'")}', '${(coverUrl || '').replace(/'/g, "\\'")}')">Añadir</button>
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('addGameDetailModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('addGameDetailModal'));
    modal.show();
    
    document.getElementById('addGameDetailModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function setAddRating(rating) {
    document.getElementById('addRating').value = rating;
    
    document.querySelectorAll('#addStarRating .star').forEach((star, index) => {
<<<<<<< HEAD
        if (index < rating) {
            star.style.color = '#ffd700';
            star.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        } else {
            star.style.color = '#444';
            star.style.textShadow = 'none';
        }
=======
        star.style.color = index < rating ? '#ffc107' : '#6c757d';
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
    });
}

async function confirmAddGame(igdbId, gameName, coverUrl) {
    const token = localStorage.getItem('authToken');
    const rating = parseInt(document.getElementById('addRating').value) || 0;
    
    const gameData = {
        igdbId,
        gameName,
<<<<<<< HEAD
        coverUrl: coverUrl || 'https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada',
=======
        coverUrl: coverUrl || '/img/no-cover.jpg',
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
        status: document.getElementById('addStatus').value,
        platform: document.getElementById('addPlatform').value,
        userRating: rating > 0 ? rating * 2 : null,
        hoursPlayed: parseFloat(document.getElementById('addHours').value) || 0,
        notes: document.getElementById('addReview').value
    };

    try {
        const response = await fetch(`${API_URL}/games/library/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(gameData)
        });

        const data = await response.json();

        if (response.ok) {
            const addModal = bootstrap.Modal.getInstance(document.getElementById('addGameDetailModal'));
            addModal.hide();
            
            const searchModal = bootstrap.Modal.getInstance(document.getElementById('addGameModal'));
            if (searchModal) searchModal.hide();

            await loadUserLibrary();
            showSuccessMessage(`¡Tu juego "${gameName}" ha sido añadido con éxito!`);
        } else {
            showError(data.message || 'Error al agregar juego');
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión al agregar juego');
    }
}

function showSuccessMessage(message) {
    const successHTML = `
        <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">
            <div class="toast show bg-success text-white" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-check-circle me-2"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
    
    setTimeout(() => {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
    }, 3000);
}

// ========================================
<<<<<<< HEAD
// MODAL DE DETALLES/RESEÑA (MEJORADO) ✨
=======
// MODAL DE DETALLES/RESEÑA (SOLO LECTURA)
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
// ========================================

function openDetailModal(gameId) {
    const game = allGames.find(g => g._id === gameId);
    if (!game) return;

    const rating = game.userRating ? Math.ceil(game.userRating / 2) : 0;
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    
<<<<<<< HEAD
    // ✅ FIX: Usar getValidCoverUrl() aquí también
    const validCoverUrl = getValidCoverUrl(game.coverUrl);
    
=======
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
    const modalHTML = `
        <div class="modal fade" id="detailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #0f3460;">
                    <div class="modal-header border-0 pb-2">
                        <h5 class="modal-title fw-bold" style="color: #00d4ff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);">
                            ${game.gameName}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body pt-2">
                        <div class="row g-4">
                            <!-- Columna Izquierda: Portada y Estado -->
                            <div class="col-md-4">
<<<<<<< HEAD
                                <img src="${validCoverUrl}" 
                                     class="img-fluid rounded shadow-lg mb-3" 
                                     alt="${game.gameName}"
                                     style="width: 100%; object-fit: contain; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border: 2px solid #00d4ff;"
                                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';">
=======
                                <img src="${game.coverUrl || '/img/no-cover.jpg'}" 
                                     class="img-fluid rounded shadow-lg mb-3" 
                                     alt="${game.gameName}"
                                     style="width: 100%; object-fit: contain; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border: 2px solid #00d4ff;"
                                     onerror="this.onerror=null; this.src='/img/no-cover.jpg';">
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
                                
                                <!-- Estado del juego -->
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-flag-checkered me-2"></i>Estado del juego
                                    </label>
                                    <div class="p-3 rounded" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #00d4ff;">
                                        <span class="badge ${getStatusBadgeClass(game.status)} w-100 py-2" style="font-size: 1rem;">
                                            ${game.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Columna Derecha: Información del juego -->
                            <div class="col-md-8">
                                <!-- Horas jugadas -->
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="far fa-clock me-2"></i>Horas jugadas
                                    </label>
                                    <div class="p-3 rounded d-flex align-items-center" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460;">
                                        <i class="far fa-clock me-3" style="color: #00d4ff; font-size: 1.5rem;"></i>
                                        <span class="fs-5 fw-bold" style="color: #ffffff;">${game.hoursPlayed || 0}h</span>
                                    </div>
                                </div>
                                
                                <!-- Plataforma -->
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-gamepad me-2"></i>Plataforma
                                    </label>
                                    <div class="p-3 rounded d-flex align-items-center" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460;">
                                        <i class="fas fa-gamepad me-3" style="color: #00d4ff; font-size: 1.5rem;"></i>
                                        <span class="fs-5 fw-bold" style="color: #ffffff;">${game.platform}</span>
                                    </div>
                                </div>
                                
                                <!-- Calificación -->
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-star me-2"></i>Calificación
                                    </label>
                                    <div class="p-3 rounded text-center" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460;">
                                        <div style="font-size: 2rem; letter-spacing: 3px;">
                                            ${rating > 0 
                                                ? `<span style="color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">${stars}</span>` 
                                                : '<span style="color: #555;">☆☆☆☆☆</span>'}
                                        </div>
                                        <div class="mt-2">
                                            ${rating > 0 
                                                ? `<span class="badge bg-warning text-dark px-3 py-1">${rating}/5 Estrellas</span>` 
                                                : '<span class="badge bg-secondary px-3 py-1">Sin calificar</span>'}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Reseña -->
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold mb-2" style="color: #00d4ff; letter-spacing: 1px;">
                                        <i class="fas fa-comment-dots me-2"></i>Reseña
                                    </label>
                                    <div class="p-3 rounded" style="background: rgba(15, 52, 96, 0.4); border: 1px solid #0f3460; max-height: 180px; overflow-y: auto;">
                                        ${game.notes 
                                            ? `<p class="mb-0" style="color: #e0e0e0; line-height: 1.6; white-space: pre-wrap;">${game.notes}</p>` 
                                            : '<em class="text-muted"><i class="fas fa-pen me-2"></i>Aún no has escrito una reseña para este juego</em>'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Botones de acción -->
                        <div class="d-flex gap-3 mt-4">
                            <button type="button" class="btn btn-outline-light flex-grow-1 py-2" data-bs-dismiss="modal" style="border-width: 2px;">
                                <i class="fas fa-times me-2"></i>Cerrar
                            </button>
                            <button type="button" class="btn btn-neon flex-grow-1 py-2" onclick="closeDetailAndOpenEdit('${game._id}')" style="box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);">
                                <i class="fas fa-edit me-2"></i>Editar Juego
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('detailModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
    
    document.getElementById('detailModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

<<<<<<< HEAD
=======
// Mantener la función auxiliar para cerrar y abrir edición
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
function closeDetailAndOpenEdit(gameId) {
    const detailModal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
    if (detailModal) detailModal.hide();
    
    setTimeout(() => openEditModal(gameId), 300);
}

<<<<<<< HEAD
=======
function closeDetailAndOpenEdit(gameId) {
    // Cerrar modal de reseña
    const detailModal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
    if (detailModal) detailModal.hide();
    
    // Abrir modal de edición
    setTimeout(() => openEditModal(gameId), 300);
}

>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496
// ========================================
// MODAL DE EDITAR (TODOS LOS CAMPOS EDITABLES)
// ========================================

function openEditModal(gameId) {
    const game = allGames.find(g => g._id === gameId);
    if (!game) return;

    document.getElementById('editGameId').value = game._id;
    document.getElementById('editStatus').value = game.status;
    document.getElementById('editPlatform').value = game.platform;
    document.getElementById('editRating').value = game.userRating || '';
    document.getElementById('editHours').value = game.hoursPlayed || 0;
    document.getElementById('editNotes').value = game.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('editGameModal'));
    modal.show();
}

async function updateGame() {
    const token = localStorage.getItem('authToken');
    const gameId = document.getElementById('editGameId').value;

    const updateData = {
        status: document.getElementById('editStatus').value,
        platform: document.getElementById('editPlatform').value,
        userRating: parseInt(document.getElementById('editRating').value) || null,
        hoursPlayed: parseFloat(document.getElementById('editHours').value) || 0,
        notes: document.getElementById('editNotes').value
    };

    try {
        const response = await fetch(`${API_URL}/games/library/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editGameModal'));
            modal.hide();

            await loadUserLibrary();
            showSuccess('Juego actualizado exitosamente');
        } else {
            showError('Error al actualizar juego');
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión al actualizar juego');
    }
}

// ========================================
// ELIMINAR JUEGO
// ========================================

async function deleteGame(gameId, gameName) {
    if (!confirm(`¿Estás seguro de eliminar "${gameName}" de tu biblioteca?`)) {
        return;
    }

    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_URL}/games/library/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadUserLibrary();
            showSuccess(`${gameName} eliminado de tu biblioteca`);
        } else {
            showError('Error al eliminar juego');
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión al eliminar juego');
    }
}

// ========================================
// UTILIDADES
// ========================================

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
}