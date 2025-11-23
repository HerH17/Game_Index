// js/dashboard.js - CON NOTIFICACIONES DE COMENTARIOS

document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        fetchDashboardData(authToken);
        checkNewComments(authToken);
    }
});

async function fetchDashboardData(token) {
    try {
        const response = await fetch('http://localhost:5000/api/games/library', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Sesión expirada o error al cargar los datos.');
        }

        const data = await response.json();

        renderStats(data.stats);
        renderRecentActivity(data.entries);

    } catch (error) {
        console.error("Error al cargar el dashboard:", error.message);
        const activityBody = document.getElementById('recentActivityBody');
        if (activityBody) {
            activityBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-danger">
                        Error al cargar los datos. Por favor, recarga la página.
                    </td>
                </tr>
            `;
        }
    }
}

async function checkNewComments(token) {
    try {
        const username = localStorage.getItem('username');
        
        // Obtener biblioteca del usuario
        const response = await fetch('http://localhost:5000/api/games/library', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        const reviewsWithNotes = data.entries.filter(e => e.notes && e.notes.trim() !== '');
        
        let totalNewComments = 0;
        
        // Verificar comentarios nuevos en cada reseña
        for (const review of reviewsWithNotes) {
            const commentsResponse = await fetch(`http://localhost:5000/api/comments/${review._id}`);
            if (!commentsResponse.ok) continue;
            
            const commentsData = await commentsResponse.json();
            const comments = commentsData.comments || [];
            
            // Contar comentarios nuevos (después de la última actualización y que no sean del usuario)
            const newComments = comments.filter(c => 
                new Date(c.createdAt) > new Date(review.updatedAt) && 
                c.username !== username
            ).length;
            
            totalNewComments += newComments;
        }
        
        // Mostrar notificación en el enlace de "Mis Reseñas"
        if (totalNewComments > 0) {
            updateReviewsLinkNotification(totalNewComments);
        }
        
    } catch (error) {
        console.error('Error verificando comentarios nuevos:', error);
    }
}

function updateReviewsLinkNotification(count) {
    // Buscar el enlace de "Mis Reseñas" en el sidebar
    const reviewsLink = document.querySelector('a[href="reviews.html"]');
    
    if (reviewsLink && !reviewsLink.querySelector('.notification-badge')) {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = count;
        badge.style.cssText = `
            background: #dc3545;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.75rem;
            margin-left: 8px;
            font-weight: bold;
            animation: pulse 2s infinite;
        `;
        reviewsLink.appendChild(badge);
        
        // Agregar animación de pulso
        if (!document.getElementById('pulse-animation-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation-style';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

function renderStats(stats) {
    const completedEl = document.getElementById('gamesCompletedCount');
    const playingEl = document.getElementById('gamesPlayingCount');
    const hoursEl = document.getElementById('totalHoursCount');

    if (completedEl) completedEl.textContent = stats.completed || 0;
    if (playingEl) playingEl.textContent = stats.playing || 0;
    if (hoursEl) hoursEl.textContent = stats.totalHours || 0;
}

function renderRecentActivity(entries) {
    const tableBody = document.getElementById('recentActivityBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (!entries || entries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    No hay actividad reciente. ¡Añade tu primer juego!
                </td>
            </tr>
        `;
        return;
    }

    const recentEntries = entries.slice(0, 5);

    recentEntries.forEach(entry => {
        const gameTitle = entry.gameName || 'Sin título';
        
        const rating = entry.userRating 
            ? '⭐'.repeat(Math.min(5, Math.ceil(entry.userRating / 2))) 
            : 'N/A';
        
        const date = entry.updatedAt 
            ? new Date(entry.updatedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : 'N/A';

        const statusColor = getStatusBadgeColor(entry.status);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color: #ffffff;">${gameTitle}</td>
            <td><span class="badge ${statusColor}">${entry.status}</span></td>
            <td style="color: #ffc107;">${rating}</td>
            <td style="color: #cccccc;">${date}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusBadgeColor(status) {
    const colors = {
        'Completado': 'bg-success',
        'Jugando': 'bg-primary',
        'Pendiente': 'bg-warning text-dark',
        'Abandonado': 'bg-danger',
        'Deseado': 'bg-info'
    };
    return colors[status] || 'bg-secondary';
}