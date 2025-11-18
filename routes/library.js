// routes/library.js

const express = require('express');
const router = express.Router();
const TrackerEntry = require('../models/trackerEntry');
const authMiddleware = require('../middleware/auth');

// Ruta protegida: Obtiene la biblioteca personal del usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Ya NO usamos populate porque no hay relación con Game
        // Los datos del juego están directamente en TrackerEntry
        const entries = await TrackerEntry.find({ userId: userId })
            .sort({ updatedAt: -1 });

        // Calcular estadísticas
        const completed = entries.filter(e => e.status === 'Completado').length;
        const playing = entries.filter(e => e.status === 'Jugando').length;
        const totalHours = entries.reduce((sum, e) => sum + (e.hoursPlayed || 0), 0);

        res.status(200).json({
            entries: entries,
            stats: { 
                completed, 
                playing, 
                totalHours: totalHours.toFixed(1) 
            }
        });
    } catch (error) {
        console.error("Error al obtener la biblioteca:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;