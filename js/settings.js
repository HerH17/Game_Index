// js/settings.js

const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    loadUserSettings();
    loadUserStats();
    setupEventListeners();
});

function setupEventListeners() {
    // Formulario de información personal
    document.getElementById('personalInfoForm')?.addEventListener('submit', updatePersonalInfo);
    
    // Formulario de contraseña
    document.getElementById('passwordForm')?.addEventListener('submit', updatePassword);
    
    // Auto-calcular edad cuando cambia la fecha de nacimiento
    document.getElementById('settingsDOB')?.addEventListener('change', (e) => {
        const dob = new Date(e.target.value);
        const age = calculateAge(dob);
        document.getElementById('settingsAge').value = age;
    });
}

async function loadUserSettings() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            document.getElementById('settingsUsername').value = user.username || '';
            document.getElementById('settingsEmail').value = user.email || '';
            document.getElementById('settingsDOB').value = user.dob ? user.dob.split('T')[0] : '';
            document.getElementById('settingsAge').value = user.age || '';
            
            // Preferencias (si existen)
            if (user.preferences) {
                document.getElementById('favoritePlatform').value = user.preferences.favoritePlatform || '';
                document.getElementById('favoriteGenre').value = user.preferences.favoriteGenre || '';
                document.getElementById('publicProfile').checked = user.preferences.publicProfile !== false;
                document.getElementById('emailNotifications').checked = user.preferences.emailNotifications !== false;
            }
            
            // Fecha de registro
            if (user.createdAt) {
                const year = new Date(user.createdAt).getFullYear();
                document.getElementById('memberSince').textContent = year;
            }
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}

async function loadUserStats() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/games/library`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('totalGames').textContent = data.entries.length;
            document.getElementById('totalReviews').textContent = data.entries.filter(e => e.notes).length;
            document.getElementById('totalHours').textContent = data.stats.totalHours + 'h';
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function updatePersonalInfo(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    const updateData = {
        email: document.getElementById('settingsEmail').value,
        dob: document.getElementById('settingsDOB').value,
        age: parseInt(document.getElementById('settingsAge').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            showSuccess('Información actualizada correctamente');
        } else {
            const data = await response.json();
            showError(data.message || 'Error al actualizar información');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

async function updatePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/user/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.ok) {
            showSuccess('Contraseña actualizada correctamente');
            document.getElementById('passwordForm').reset();
        } else {
            const data = await response.json();
            showError(data.message || 'Error al cambiar contraseña');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

async function savePreferences() {
    const token = localStorage.getItem('authToken');
    
    const preferences = {
        favoritePlatform: document.getElementById('favoritePlatform').value,
        favoriteGenre: document.getElementById('favoriteGenre').value,
        publicProfile: document.getElementById('publicProfile').checked,
        emailNotifications: document.getElementById('emailNotifications').checked
    };
    
    try {
        const response = await fetch(`${API_URL}/user/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(preferences)
        });

        if (response.ok) {
            showSuccess('Preferencias guardadas correctamente');
        } else {
            showError('Error al guardar preferencias');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

function confirmDeleteAccount() {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción es PERMANENTE y eliminará:\n- Tu perfil\n- Tu biblioteca de juegos\n- Todas tus reseñas\n\n¿Deseas continuar?')) {
        if (confirm('Esta es tu última oportunidad. ¿Realmente quieres eliminar tu cuenta?')) {
            deleteAccount();
        }
    }
}

async function deleteAccount() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/user/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Tu cuenta ha sido eliminada');
            localStorage.clear();
            window.location.href = 'index.html';
        } else {
            showError('Error al eliminar cuenta');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión');
    }
}

function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}