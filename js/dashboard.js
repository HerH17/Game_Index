// js/dashboard.js

// -----------------------------------------------------
// CARGAR DATOS DEL DASHBOARD
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        fetchDashboardData(authToken);
    }
    // Si no hay token, session.js redirigirá al index.html
});

/**
 * Solicita los datos de la biblioteca y estadísticas al backend.
 * @param {string} token - El JWT del usuario.
 */
async function fetchDashboardData(token) {
    try {
        // ✅ CORREGIDO: Usar la ruta correcta de games/library
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

        // Renderizar las estadísticas y la actividad
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

// -----------------------------------------------------
// FUNCIONES DE RENDERIZADO
// -----------------------------------------------------

/**
 * Renderiza las estadísticas en las tarjetas del dashboard.
 * @param {object} stats - Objeto con { completed, playing, totalHours }.
 */
function renderStats(stats) {
    const completedEl = document.getElementById('gamesCompletedCount');
    const playingEl = document.getElementById('gamesPlayingCount');
    const hoursEl = document.getElementById('totalHoursCount');

    if (completedEl) completedEl.textContent = stats.completed || 0;
    if (playingEl) playingEl.textContent = stats.playing || 0;
    if (hoursEl) hoursEl.textContent = stats.totalHours || 0;
}

/**
 * Renderiza la actividad reciente en la tabla.
 * @param {Array<object>} entries - Lista de entradas de seguimiento recientes.
 */
function renderRecentActivity(entries) {
    const tableBody = document.getElementById('recentActivityBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = ''; // Limpiar la tabla

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

    // ✅ CORREGIDO: Mostrar solo los 5 más recientes
    const recentEntries = entries.slice(0, 5);

    recentEntries.forEach(entry => {
        // ✅ CORREGIDO: El nombre del juego está en "gameName", no en "gameId.title" ni "title"
        const gameTitle = entry.gameName || 'Sin título';
        
        // ✅ CORREGIDO: Convertir rating de 1-10 a estrellas de 1-5
        const rating = entry.userRating 
            ? '⭐'.repeat(Math.min(5, Math.ceil(entry.userRating / 2))) 
            : 'N/A';
        
        // Formatear fecha
        const date = entry.updatedAt 
            ? new Date(entry.updatedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : 'N/A';

        // ✅ Color del badge según el estado
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

/**
 * Obtiene el color del badge según el estado
 * @param {string} status - Estado del juego
 * @returns {string} - Clase de Bootstrap para el color
 */
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