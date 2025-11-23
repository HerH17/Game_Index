// js/reviews.js - CON NOTIFICACIONES DE COMENTARIOS

const API_URL = 'http://localhost:5000/api';
let allReviews = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    loadUserReviews();
    setupSortListener();
});

async function loadUserReviews() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    try {
        const response = await fetch(`${API_URL}/games/library`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar reseñas');
        }

        const data = await response.json();
        
        // Filtrar solo juegos con reseñas (notes no vacío)
        allReviews = data.entries.filter(game => game.notes && game.notes.trim() !== '');
        
        renderReviews(allReviews, username);

    } catch (error) {
        console.error('Error:', error);
        showError('No se pudieron cargar las reseñas');
    }
}

async function renderReviews(reviews, username) {
    const container = document.getElementById('reviewsContainer');
    const countEl = document.getElementById('reviewCount');
    
    if (countEl) {
        countEl.textContent = reviews.length === 1 
            ? '1 reseña publicada' 
            : `${reviews.length} reseñas publicadas`;
    }
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center my-5">
                <i class="fas fa-pen-fancy fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">Aún no has escrito ninguna reseña</h4>
                <p class="text-muted">Ve a tu biblioteca y comienza a compartir tu opinión sobre los juegos que has jugado.</p>
                <a href="library.html" class="btn btn-neon mt-3">
                    <i class="fas fa-book-open me-2"></i>Ir a Mi Biblioteca
                </a>
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

        // Obtener comentarios y verificar si hay nuevos
        const commentsResponse = await fetch(`${API_URL}/comments/${review._id}`);
        const commentsData = await commentsResponse.json();
        const comments = commentsData.comments || [];
        const commentCount = comments.length;
        
        // Verificar si hay comentarios nuevos (después de la última actualización de la reseña)
        const hasNewComments = comments.some(c => 
            new Date(c.createdAt) > new Date(review.updatedAt) && 
            c.username !== username
        );

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
                    </div>
                    
                    <div class="col-md-9 col-lg-10">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h4 class="mb-2" style="color: #00d4ff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);">
                                    ${review.gameName}
                                </h4>
                                <div class="text-muted small">
                                    <strong style="color: #ffffff;"><i class="fas fa-user-circle me-2"></i></strong>
                                    <strong style="color: #ffffff;">Por ${username}</strong>
                                    <strong style="color: #ffffff;"><span class="mx-2">•</span></strong>
                                    <strong style="color: #ffffff;"><i class="far fa-calendar-alt me-2"></i></strong>
                                    <strong style="color: #ffffff;">${reviewDate}</strong>
                                    <strong style="color: #ffffff;"><span class="mx-2">•</span></strong>
                                    <strong style="color: #ffffff;"><i class="fas fa-gamepad me-2"></i></strong>
                                    <strong style="color: #ffffff">${review.platform}</strong>
                                    ${review.hoursPlayed > 0 ? `<strong style="color: #ffffff;"><span class="mx-2">•</span></strong><strong style="color: #ffffff;"><i class="far fa-clock me-2"></i></strong><strong style="color: #ffffff;"><span>${review.hoursPlayed}h jugadas </span></strong>` : ''}
                                </div>
                            </div>
                            
                            <button class="btn btn-sm btn-outline-primary" onclick="editReview('${review._id}')">
                                <i class="fas fa-edit me-1"></i>Editar
                            </button>
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
                                    ${hasNewComments ? `
                                        <span class="badge bg-danger ms-2 pulse-animation">
                                            <i class="fas fa-exclamation"></i> Nuevo
                                        </span>
                                    ` : ''}
                                </h6>
                                <button class="btn btn-sm btn-outline-primary" onclick="toggleMyComments('${review._id}')">
                                    <i class="fas fa-chevron-down" id="icon-${review._id}"></i>
                                </button>
                            </div>
                            
                            <div id="comments-${review._id}" class="comments-container" style="display: none;">
                                ${await renderMyReviewComments(review._id, username)}
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

async function renderMyReviewComments(reviewId, myUsername) {
    try {
        const response = await fetch(`${API_URL}/comments/${reviewId}`);
        const data = await response.json();
        const comments = data.comments || [];
        
        if (comments.length === 0) {
            return '<p class="text-muted text-center mb-0">No hay comentarios en esta reseña</p>';
        }
        
        let html = '<div class="comments-list">';
        comments.forEach(comment => {
            const commentDate = new Date(comment.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const isOwnComment = myUsername === comment.username;
            
            html += `
                <div class="comment-item p-3 mb-2 rounded ${isOwnComment ? 'border border-primary' : ''}" 
                     style="background: ${isOwnComment ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-1">
                                <i class="fas fa-user-circle me-2" style="color: ${isOwnComment ? '#00d4ff' : '#ffffff'};"></i>
                                <strong style="color: ${isOwnComment ? '#00d4ff' : '#ffffff'};">
                                    ${comment.username}
                                    ${isOwnComment ? '<span class="badge bg-primary ms-2">Tú</span>' : ''}
                                </strong>
                                <small class="text-muted ms-2">${commentDate}</small>
                            </div>
                            <p class="mb-0 ms-4" style="color: #e0e0e0;">${comment.content}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
        
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        return '<p class="text-danger">Error al cargar comentarios</p>';
    }
}

function toggleMyComments(reviewId) {
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

function setupSortListener() {
    const sortSelect = document.getElementById('sortReviews');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const username = localStorage.getItem('username');
            
            let sortedReviews = [...allReviews];
            
            switch(sortBy) {
                case 'rating':
                    sortedReviews.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
                    break;
                case 'name':
                    sortedReviews.sort((a, b) => a.gameName.localeCompare(b.gameName));
                    break;
                case 'recent':
                default:
                    sortedReviews.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    break;
            }
            
            renderReviews(sortedReviews, username);
        });
    }
}

function editReview(gameId) {
    window.location.href = `library.html?edit=${gameId}`;
}

function showError(message) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
        </div>
    `;
}