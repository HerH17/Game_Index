// js/public-reviews.js - CON COMENTARIOS

const API_URL = 'http://localhost:5000/api';
let allPublicReviews = [];
let searchTimeout;

document.addEventListener('DOMContentLoaded', () => {
    loadPublicReviews();
    setupPublicReviewsFilters();
    updateAuthButton();
});

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

async function loadPublicReviews() {
    const container = document.getElementById('publicReviewsContainer');
    
    try {
        const response = await fetch(`${API_URL}/games/reviews/public`);
        
        if (!response.ok) {
            throw new Error('Error al cargar reseñas públicas');
        }

        const data = await response.json();
        allPublicReviews = data.reviews.filter(review => review.notes && review.notes.trim() !== '');
        
        console.log(`✅ ${allPublicReviews.length} reseñas públicas cargadas`);
        
        renderPublicReviews(allPublicReviews);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="col-12 text-center my-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4 class="text-danger">Error al cargar reseñas</h4>
                <p class="text-light">${error.message}</p>
            </div>
        `;
    }
}

async function renderPublicReviews(reviews) {
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
                <h4 class="text-light">No hay reseñas disponibles</h4>
                <p class="text-light">Sé el primero en compartir tu opinión sobre un juego.</p>
            </div>
        `;
        return;
    }

    const reviewsHTML = await Promise.all(reviews.map(async review => {
        const coverImage = getValidCoverUrl(review.coverUrl);
        const rating = review.userRating ? Math.ceil(review.userRating / 2) : 0;
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        const reviewDate = new Date(review.updatedAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Obtener comentarios
        const commentsResponse = await fetch(`${API_URL}/comments/${review._id}`);
        const commentsData = await commentsResponse.json();
        const comments = commentsData.comments || [];
        const commentCount = comments.length;

        return `
        <div class="card mb-4 shadow-sm" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #0f3460;">
            <div class="card-body p-4">
                <div class="row">
                    <div class="col-md-3 col-lg-2 text-center mb-3 mb-md-0">
                        <img src="${coverImage}" 
                            class="img-fluid rounded shadow-lg" 
                            alt="${review.gameName}"
                            style="max-height: 250px; object-fit: contain; background: #1a1a1a; border: 2px solid #00d4ff;"
                            onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300/1a1a2e/00d4ff?text=Sin+Portada';">
                        
                        <div class="mt-3">
                            <div style="font-size: 1.5rem; letter-spacing: 2px;">
                                ${rating > 0 
                                    ? `<span style="color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">${stars}</span>` 
                                    : '<span style="color: #555;">☆☆☆☆☆</span>'}
                            </div>
                            ${rating > 0 ? `<small class="text-light">${rating}/5</small>` : ''}
                        </div>

                        <div class="mt-2">
                            <span class="badge ${getStatusBadgeClass(review.status)} w-100 py-1">
                                ${review.status}
                            </span>
                        </div>

                        ${review.hoursPlayed > 0 ? `
                            <div class="mt-2">
                                <small class="text-light">
                                    <i class="far fa-clock me-1"></i>${review.hoursPlayed}h jugadas
                                </small>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="col-md-9 col-lg-10">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h4 class="mb-2" style="color: #00d4ff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);">
                                    ${review.gameName}
                                </h4>
                                <div class="text-muted small">
                                    <strong style="color: #ffffff;"><i class="fas fa-user-circle me-2"></i></strong>
                                    <strong style="color: #ffffff;">Por ${review.username || 'Anónimo'}</strong>
                                    <strong style="color: #ffffff;"><span class="mx-2">•</span></strong>
                                    <strong style="color: #ffffff;"><i class="far fa-calendar-alt me-2"></i></strong>
                                    <strong style="color: #ffffff;">${reviewDate}</strong>
                                    <strong style="color: #ffffff;"><span class="mx-2">•</span></strong>
                                    <strong style="color: #ffffff;"><i class="fas fa-gamepad me-2"></i></strong>
                                    <strong style="color: #ffffff;">${review.platform}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div class="review-content p-3 rounded mb-3" style="background: rgba(15, 52, 96, 0.3); border-left: 4px solid #00d4ff;">
                            <p class="mb-0" style="color: #e0e0e0; line-height: 1.8; white-space: pre-wrap;">${review.notes}</p>
                        </div>
                        
                        <div class="mt-3 mb-3">
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

                        <!-- Sección de Comentarios -->
                        <div class="comments-section mt-4 p-3 rounded" style="background: rgba(15, 52, 96, 0.2); border: 1px solid #0f3460;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="mb-0" style="color: #00d4ff;">
                                    <i class="fas fa-comments me-2"></i>Comentarios (${commentCount})
                                </h6>
                                <button class="btn btn-sm btn-outline-primary" onclick="toggleComments('${review._id}')">
                                    <i class="fas fa-chevron-down" id="icon-${review._id}"></i>
                                </button>
                            </div>
                            
                            <div id="comments-${review._id}" class="comments-container" style="display: none;">
                                ${await renderComments(review._id)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }));

    container.innerHTML = reviewsHTML.join('');
}

async function renderComments(reviewId) {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    try {
        const response = await fetch(`${API_URL}/comments/${reviewId}`);
        const data = await response.json();
        const comments = data.comments || [];
        
        let html = '';
        
        // Formulario para agregar comentario (solo si está logueado)
        if (token && username) {
            html += `
                <div class="add-comment mb-3 p-3 rounded" style="background: rgba(15, 52, 96, 0.3);">
                    <textarea class="form-control custom-input mb-2" 
                              id="comment-input-${reviewId}" 
                              rows="2" 
                              placeholder="Escribe un comentario..."
                              maxlength="500"></textarea>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted" id="char-count-${reviewId}">0/500</small>
                        <button class="btn btn-sm btn-neon" onclick="postComment('${reviewId}')">
                            <i class="fas fa-paper-plane me-1"></i>Comentar
                        </button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="alert alert-info mb-3">
                    <i class="fas fa-info-circle me-2"></i>
                    <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" style="color: #00d4ff;">Inicia sesión</a> 
                    para dejar un comentario
                </div>
            `;
        }
        
        // Lista de comentarios
        if (comments.length > 0) {
            html += '<div class="comments-list">';
            comments.forEach(comment => {
                const commentDate = new Date(comment.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const isOwner = username === comment.username;
                
                html += `
                    <div class="comment-item p-2 mb-2 rounded" style="background: rgba(255, 255, 255, 0.05);">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fas fa-user-circle me-2" style="color: #00d4ff;"></i>
                                    <strong style="color: #ffffff;">${comment.username}</strong>
                                    <small class="text-muted ms-2">${commentDate}</small>
                                </div>
                                <p class="mb-0 ms-4" style="color: #e0e0e0;">${comment.content}</p>
                            </div>
                            ${isOwner ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteComment('${comment._id}', '${reviewId}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<p class="text-muted text-center mb-0">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
        }
        
        return html;
        
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        return '<p class="text-danger">Error al cargar comentarios</p>';
    }
}

function toggleComments(reviewId) {
    const container = document.getElementById(`comments-${reviewId}`);
    const icon = document.getElementById(`icon-${reviewId}`);
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        container.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

async function postComment(reviewId) {
    const token = localStorage.getItem('authToken');
    const input = document.getElementById(`comment-input-${reviewId}`);
    const content = input.value.trim();
    
    if (!token) {
        alert('Debes iniciar sesión para comentar');
        return;
    }
    
    if (!content) {
        alert('El comentario no puede estar vacío');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reviewId, content })
        });
        
        if (response.ok) {
            input.value = '';
            // Recargar comentarios
            const commentsContainer = document.getElementById(`comments-${reviewId}`);
            commentsContainer.innerHTML = await renderComments(reviewId);
        } else {
            const data = await response.json();
            alert(data.message || 'Error al publicar comentario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

async function deleteComment(commentId, reviewId) {
    if (!confirm('¿Eliminar este comentario?')) return;
    
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Recargar comentarios
            const commentsContainer = document.getElementById(`comments-${reviewId}`);
            commentsContainer.innerHTML = await renderComments(reviewId);
        } else {
            alert('Error al eliminar comentario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Contador de caracteres
document.addEventListener('input', (e) => {
    if (e.target.id && e.target.id.startsWith('comment-input-')) {
        const reviewId = e.target.id.replace('comment-input-', '');
        const counter = document.getElementById(`char-count-${reviewId}`);
        if (counter) {
            counter.textContent = `${e.target.value.length}/500`;
        }
    }
});

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
            filtered.sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0));
            break;
    }
    
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    const searchQuery = document.getElementById('searchReviewGame').value.toLowerCase().trim();
    if (searchQuery) {
        filtered = filtered.filter(r => r.gameName.toLowerCase().includes(searchQuery));
    }
    
    renderPublicReviews(filtered);
}

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