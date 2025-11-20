// js/public-reviews.js - Reseñas públicas de la comunidad

const API_URL = 'http://localhost:5000/api';
let allPublicReviews = [];
let searchTimeout;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadPublicReviews();
    setupPublicReviewsFilters();
    updateAuthButton();
});

// ========================================
// ACTUALIZAR BOTÓN DE AUTENTICACIÓN
// ========================================

function updateAuthButton() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const authContainer = document.getElementById('authButtonContainer');
    
    if (token && username) {
        authContainer.innerHTML = `
            <a href="dashboard.html" class="btn btn-neon btn-sm px-3 py-1 fw-bold text-uppercase">
                <i class="fa-solid fa-user me-1"></i> ${username}
            </a>
        `;
    }
}

// ========================================
// CARGAR TODAS LAS RESEÑAS PÚBLICAS
// ========================================

async function loadPublicReviews() {
    const container = document.getElementById('publicReviewsContainer');
    
    try {
        // Obtener TODAS las entradas de TODOS los usuarios (sin token)
        const response = await fetch(`${API_URL}/games/reviews/public`);
        
        if (!response.ok) {
            throw new Error('Error al cargar reseñas públicas');
        }

        const data = await response.json();
        
        // Filtrar solo las que tienen reseñas
        allPublicReviews = data.reviews.filter(review => review.notes && review.notes.trim() !== '');
        
        console.log(`✅ ${allPublicReviews.length} reseñas públicas cargadas`);
        
        renderPublicReviews(allPublicReviews);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="col-12 text-center my-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4 class="text-danger">Error al cargar reseñas</h4>
                <p class="text-muted">${error.message}</p>
            </div>
        `;
    }
}

// ========================================
// RENDERIZAR RESEÑAS PÚBLICAS
// ========================================

function renderPublicReviews(reviews) {
    const container = document.getElementById('publicReviewsContainer');
    const countEl = document.getElementById('reviewsCount');
    
    if (countEl) {
        countEl.textContent = reviews.length === 1 
            ? '1 reseña encontrada' 
            : `${reviews.length} reseñas encontradas`;
    }
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center my-5">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No hay reseñas disponibles</h4>
                <p class="text-muted">Sé el primero en compartir tu opinión sobre un juego.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => {
        const coverImage = getValidCoverUrl(review.coverUrl);
        const rating = review.userRating ? Math.ceil(review.userRating / 2) : 0;
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const reviewDate = new Date(review.updatedAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        return `
        <div class="card mb-4 shadow-sm" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #0f3460;">
            <div class="card-body p-4">
                <div class="row">
                    <!-- Portada del juego -->
                    <div class="col-md-3 col-lg-2 text-center mb-3 mb-md-0">
                        <img src="${coverImage}" 
                             class="img-fluid rounded shadow-lg" 
                             alt="${review.gameName}"
                             style="max-height: 250px; object-fit: contain; background: #1a1a1a; border: 2px solid #00d4ff;"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300/1a1a2e/00d4ff?text=Sin+Portada';">
                        
                        <!-- Calificación -->
                        <div class="mt-3">
                            <div style="font-size: 1.5rem; letter-spacing: 2px;">
                                ${rating > 0 
                                    ? `<span style="color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">${stars}</span>` 
                                    : '<span style="color: #555;">☆☆☆☆☆</span>'}
                            </div>
                            ${rating > 0 ? `<small class="text-muted">${rating}/5</small>` : ''}
                        </div>

                        <!-- Estado -->
                        <div class="mt-2">
                            <span class="badge ${getStatusBadgeClass(review.status)} w-100 py-1">
                                ${review.status}
                            </span>
                        </div>

                        <!-- Horas jugadas -->
                        ${review.hoursPlayed > 0 ? `
                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="far fa-clock me-1"></i>${review.hoursPlayed}h jugadas
                                </small>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Contenido de la reseña -->
                    <div class="col-md-9 col-lg-10">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h4 class="mb-2" style="color: #00d4ff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);">
                                    ${review.gameName}
                                </h4>
                                <div class="text-muted small">
                                    <i class="fas fa-user-circle me-2"></i>
                                    <strong style="color: #ffffff;">Por ${review.username || 'Anónimo'}</strong>
                                    <span class="mx-2">•</span>
                                    <i class="far fa-calendar-alt me-2"></i>
                                    ${reviewDate}
                                    <span class="mx-2">•</span>
                                    <i class="fas fa-gamepad me-2"></i>
                                    ${review.platform}
                                </div>
                            </div>
                        </div>
                        
                        <div class="review-content p-3 rounded" style="background: rgba(15, 52, 96, 0.3); border-left: 4px solid #00d4ff;">
                            <p class="mb-0" style="color: #e0e0e0; line-height: 1.8; white-space: pre-wrap;">${review.notes}</p>
                        </div>
                        
                        <!-- Etiquetas adicionales -->
                        <div class="mt-3">
                            ${review.status === 'Completado' 
                                ? '<span class="badge bg-success me-2"><i class="fas fa-trophy me-1"></i>Completado</span>' 
                                : ''}
                            ${review.userRating >= 8 
                                ? '<span class="badge bg-warning text-dark me-2"><i class="fas fa-star me-1"></i>Altamente Recomendado</span>' 
                                : ''}
                            ${review.hoursPlayed > 50 
                                ? '<span class="badge bg-info me-2"><i class="fas fa-clock me-1"></i>+50 Horas</span>' 
                                : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ========================================
// FILTROS Y BÚSQUEDA
// ========================================

function setupPublicReviewsFilters() {
    const reviewFilter = document.getElementById('reviewFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchReviewGame');
    
    if (reviewFilter) {
        reviewFilter.addEventListener('change', applyPublicFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyPublicFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => applyPublicFilters(), 300);
        });
    }
}

function applyPublicFilters() {
    let filtered = [...allPublicReviews];
    
    // Filtro por tipo
    const reviewFilter = document.getElementById('reviewFilter').value;
    switch(reviewFilter) {
        case 'recent':
            filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            break;
        case 'rating':
            filtered = filtered.filter(r => r.userRating >= 8);
            filtered.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
            break;
        case 'popular':
            // Simular popularidad por horas jugadas
            filtered.sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0));
            break;
    }
    
    // Filtro por estado
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // Búsqueda por nombre
    const searchQuery = document.getElementById('searchReviewGame').value.toLowerCase().trim();
    if (searchQuery) {
        filtered = filtered.filter(r => r.gameName.toLowerCase().includes(searchQuery));
    }
    
    renderPublicReviews(filtered);
}

// ========================================
// UTILIDADES
// ========================================

function getValidCoverUrl(coverUrl) {
    if (!coverUrl || coverUrl === 'null' || coverUrl === 'undefined') {
        return 'https://via.placeholder.com/200x300/1a1a2e/00d4ff?text=Sin+Portada';
    }
    
    if (coverUrl.startsWith('/img/no-cover.jpg')) {
        return 'https://via.placeholder.com/200x300/1a1a2e/00d4ff?text=Sin+Portada';
    }
    
    return coverUrl;
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