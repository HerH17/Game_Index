// js/game-catalog.js - ERROR CORREGIDO

const API_URL = 'http://localhost:5000/api';
let allCatalogGames = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPopularGames();
    setupCatalogEventListeners();
});

function setupCatalogEventListeners() {
    const searchInput = document.getElementById('catalogSearchInput');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                if (query.length === 0) loadPopularGames();
                return;
            }
            
            searchTimeout = setTimeout(() => searchCatalogGames(query), 500);
        });
    }
    
    const genreFilter = document.getElementById('genreFilter');
    const platformFilter = document.getElementById('platformCatalogFilter');
    const sortFilter = document.getElementById('sortCatalogBy');
    
    if (genreFilter) genreFilter.addEventListener('change', applyFilters);
    if (platformFilter) platformFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
}

async function loadPopularGames() {
    const grid = document.getElementById('catalogGamesGrid');
    
    grid.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary"></div>
            <p class="text-muted mt-2">Cargando juegos populares...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/games/popular`);
        const data = await response.json();
        allCatalogGames = data.games || [];
        
        console.log('✅ Juegos cargados:', allCatalogGames.length);
        
        renderCatalogGames(allCatalogGames);
    } catch (error) {
        console.error('❌ Error:', error);
        grid.innerHTML = '<div class="col-12 text-center text-danger"><p>Error al cargar juegos</p></div>';
    }
}

async function searchCatalogGames(query) {
    const grid = document.getElementById('catalogGamesGrid');
    grid.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary"></div>
            <p class="text-muted mt-2">Buscando "${query}"...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/games/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        allCatalogGames = data.games || [];
        
        if (allCatalogGames.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center"><h4 class="text-muted">No se encontraron juegos</h4></div>';
            return;
        }
        
        applyFilters();
    } catch (error) {
        console.error('❌ Error:', error);
        grid.innerHTML = '<div class="col-12 text-center text-danger"><p>Error en búsqueda</p></div>';
    }
}

function applyFilters() {
    let filtered = [...allCatalogGames];
    
    const genre = document.getElementById('genreFilter').value;
    if (genre !== 'all') {
        filtered = filtered.filter(g => {
            if (!g.genres || g.genres.length === 0) return false;
            return g.genres.some(gen => 
                gen.toLowerCase().includes(genre.toLowerCase()) ||
                genre.toLowerCase().includes(gen.toLowerCase())
            );
        });
    }
    
    const platform = document.getElementById('platformCatalogFilter').value;
    if (platform !== 'all') {
        filtered = filtered.filter(g => {
            if (!g.platforms || g.platforms.length === 0) return false;
            return g.platforms.some(p => 
                p.toLowerCase().includes(platform.toLowerCase()) ||
                platform.toLowerCase().includes(p.toLowerCase())
            );
        });
    }
    
    const sort = document.getElementById('sortCatalogBy').value;
    switch(sort) {
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'recent':
            filtered.sort((a, b) => (b.releaseDate || 0) - (a.releaseDate || 0));
            break;
        case 'rating':
        default:
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
    }
    
    renderCatalogGames(filtered);
}

function renderCatalogGames(games) {
    const grid = document.getElementById('catalogGamesGrid');
    
    if (games.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center my-5">
                <i class="fas fa-filter fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No hay juegos con estos filtros</h4>
                <button class="btn btn-secondary mt-3" onclick="resetFilters()">
                    <i class="fas fa-undo me-2"></i>Limpiar Filtros
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = games.map(game => {
        const coverImage = getValidCoverUrl(game.cover);
        const rating = game.rating ? Math.ceil(game.rating / 20) : 0;
        const stars = '⭐'.repeat(Math.min(5, rating));
        
        return `
        <div class="col-6 col-md-4 col-lg-3 col-xl-2">
            <div class="card bg-dark text-white h-100" style="cursor: pointer; transition: all 0.3s;" 
                 onclick="openGameDetailsModal(${game.id})"
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,212,255,0.3)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <img src="${coverImage}" class="card-img-top" alt="${game.name}"
                     style="height: 300px; object-fit: contain; background: #1a1a1a;"
                     onerror="this.src='https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';">
                
                <div class="card-body p-2">
                    <h6 class="card-title mb-2 text-center" style="font-size: 0.9rem; height: 40px; overflow: hidden;">
                        ${game.name}
                    </h6>
                    ${stars ? `<div class="text-center text-warning mb-1">${stars}</div>` : ''}
                    ${game.genres && game.genres.length > 0 ? 
                        `<div class="text-center"><small class="badge bg-primary">${game.genres[0]}</small></div>` 
                        : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function resetFilters() {
    document.getElementById('genreFilter').value = 'all';
    document.getElementById('platformCatalogFilter').value = 'all';
    document.getElementById('sortCatalogBy').value = 'rating';
    loadPopularGames();
}

async function openGameDetailsModal(gameId) {
    const game = allCatalogGames.find(g => g.id === gameId);
    if (!game) return;
    
    const coverImage = getValidCoverUrl(game.cover);
    const rating = game.rating ? Math.round(game.rating) : 0;
    const stars = rating > 0 ? '⭐'.repeat(Math.min(5, Math.ceil(rating / 20))) : '';
    
    // ✅ FIX: Escapar comillas en el summary
    const safeSummary = (game.summary || 'No hay sinopsis disponible.')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    let platformsHTML = '<span class="text-muted">N/A</span>';
    if (game.platforms && Array.isArray(game.platforms) && game.platforms.length > 0) {
        platformsHTML = game.platforms
            .slice(0, 8)
            .map(p => `<span class="badge bg-secondary">${p}</span>`)
            .join(' ');
    }
    
    const modalHTML = `
        <div class="modal fade" id="gameDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #0f3460;">
                    <div class="modal-header border-0">
                        <h5 class="modal-title fw-bold" style="color: #00d4ff;">${game.name}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${coverImage}" class="img-fluid rounded shadow-lg mb-3" alt="${game.name}"
                                     style="max-height: 400px; border: 2px solid #00d4ff;"
                                     onerror="this.src='https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';">
                                
                                <div class="mb-3 p-3 rounded" style="background: rgba(15, 52, 96, 0.4);">
                                    <label class="small text-uppercase fw-bold mb-2" style="color: #00d4ff;">Calificación Global</label>
                                    <div style="font-size: 2rem; color: #ffd700;">${stars || '☆☆☆☆☆'}</div>
                                    <small class="text-light">${rating > 0 ? rating + '/100' : 'Sin calificar'}</small>
                                </div>
                                
                                <button class="btn btn-neon w-100 py-3" onclick="openAddToCatalogModal(${game.id}, '${game.name.replace(/'/g, "\\'")}', '${coverImage.replace(/'/g, "\\'")}')">
                                    <i class="fas fa-plus-circle me-2"></i>Agregar a Mi Biblioteca
                                </button>
                            </div>
                            
                            <div class="col-md-8">
                                <h6 class="text-neon mb-2">Sinopsis</h6>
                                <p style="color: #e0e0e0; line-height: 1.8;">${game.summary || 'No hay sinopsis disponible.'}</p>
                                
                                <h6 class="text-neon mb-2 mt-3">Géneros</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${game.genres?.map(g => `<span class="badge bg-primary">${g}</span>`).join('') || '<span class="text-muted">N/A</span>'}
                                </div>
                                
                                <h6 class="text-neon mb-2 mt-3">Plataformas</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${platformsHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('gameDetailsModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('gameDetailsModal'));
    modal.show();
    
    document.getElementById('gameDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function openAddToCatalogModal(igdbId, gameName, coverUrl) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('Debes iniciar sesión para agregar juegos a tu biblioteca');
        window.location.href = 'index.html';
        return;
    }
    
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('gameDetailsModal'));
    if (detailsModal) detailsModal.hide();
    
    const validCoverUrl = getValidCoverUrl(coverUrl);
    
    const modalHTML = `
        <div class="modal fade" id="addToCatalogModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #0f3460;">
                    <div class="modal-header border-0 pb-2">
                        <h5 class="modal-title fw-bold" style="color: #00d4ff;">
                            <i class="fas fa-plus-circle me-2"></i>${gameName}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body pt-2">
                        <div class="row g-4">
                            <div class="col-md-4">
                                <img src="${validCoverUrl}" class="img-fluid rounded shadow-lg mb-3" alt="${gameName}"
                                     style="width: 100%; border: 2px solid #00d4ff;"
                                     onerror="this.src='https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';">
                                
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold" style="color: #00d4ff;">
                                        <i class="fas fa-flag-checkered me-2"></i>Estado
                                    </label>
                                    <select class="form-select custom-input" id="catalogAddStatus">
                                        <option value="Pendiente" selected>⏸ Pendiente</option>
                                        <option value="Jugando">▶ En progreso</option>
                                        <option value="Completado">✓ Completado</option>
                                        <option value="Abandonado">✗ Sin terminar</option>
                                        <option value="Deseado">★ Deseado</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold" style="color: #00d4ff;">
                                        <i class="far fa-clock me-2"></i>Horas jugadas
                                    </label>
                                    <input type="number" class="form-control custom-input" id="catalogAddHours" value="0" min="0" step="0.5">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold" style="color: #00d4ff;">
                                        <i class="fas fa-gamepad me-2"></i>Plataforma
                                    </label>
                                    <select class="form-select custom-input" id="catalogAddPlatform">
                                        <option value="PC" selected>PC</option>
                                        <option value="PlayStation 5">PlayStation 5</option>
                                        <option value="PlayStation 4">PlayStation 4</option>
                                        <option value="Xbox Series X/S">Xbox Series X/S</option>
                                        <option value="Xbox One">Xbox One</option>
                                        <option value="Nintendo Switch">Nintendo Switch</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold" style="color: #00d4ff;">
                                        <i class="fas fa-star me-2"></i>Calificación (1-5 estrellas)
                                    </label>
                                    <div class="p-3 rounded text-center" style="background: rgba(15, 52, 96, 0.4);">
                                        <div class="star-rating" id="catalogAddStarRating">
                                            ${[1, 2, 3, 4, 5].map(star => `
                                                <span class="star" data-rating="${star}" onclick="setCatalogRating(${star})"
                                                      style="cursor: pointer; font-size: 2.5rem; color: #444;">★</span>
                                            `).join('')}
                                        </div>
                                        <small class="text-light mt-2 d-block">Haz clic en una estrella</small>
                                    </div>
                                    <input type="hidden" id="catalogAddRating" value="0">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small text-uppercase fw-bold" style="color: #00d4ff;">
                                        <i class="fas fa-comment-dots me-2"></i>Reseña
                                    </label>
                                    <textarea class="form-control custom-input" id="catalogAddReview" rows="4" 
                                              placeholder="Escribe tu opinión..."></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-3 mt-4">
                            <button type="button" class="btn btn-outline-light flex-grow-1" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cancelar
                            </button>
                            <button type="button" class="btn btn-neon flex-grow-1" 
                                    onclick="confirmAddToCatalog(${igdbId}, '${gameName.replace(/'/g, "\\'")}', '${validCoverUrl.replace(/'/g, "\\'")}')">
                                <i class="fas fa-check me-2"></i>Añadir a Mi Biblioteca
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('addToCatalogModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('addToCatalogModal'));
    modal.show();
    
    document.getElementById('addToCatalogModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function setCatalogRating(rating) {
    document.getElementById('catalogAddRating').value = rating;
    
    document.querySelectorAll('#catalogAddStarRating .star').forEach((star, index) => {
        star.style.color = index < rating ? '#ffd700' : '#444';
        star.style.textShadow = index < rating ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none';
    });
}

async function confirmAddToCatalog(igdbId, gameName, coverUrl) {
    const token = localStorage.getItem('authToken');
    const rating = parseInt(document.getElementById('catalogAddRating').value) || 0;
    
    const gameData = {
        igdbId,
        gameName,
        coverUrl,
        status: document.getElementById('catalogAddStatus').value,
        platform: document.getElementById('catalogAddPlatform').value,
        userRating: rating > 0 ? rating * 2 : null,
        hoursPlayed: parseFloat(document.getElementById('catalogAddHours').value) || 0,
        notes: document.getElementById('catalogAddReview').value
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('addToCatalogModal'));
            if (modal) modal.hide();
            
            alert(`¡"${gameName}" añadido a tu biblioteca!`);
        } else {
            alert(data.message || 'Error al agregar juego');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function getValidCoverUrl(coverUrl) {
    if (!coverUrl || coverUrl === 'null' || coverUrl === 'undefined') {
        return 'https://via.placeholder.com/300x400/1a1a2e/00d4ff?text=Sin+Portada';
    }
    return coverUrl.startsWith('http') ? coverUrl : `https:${coverUrl}`;
}