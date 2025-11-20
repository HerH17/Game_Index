// routes/games.js - ORDEN CORREGIDO

const express = require('express');
const router = express.Router();
const igdbService = require('../services/igdbService');
const TrackerEntry = require('../models/trackerEntry');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ========================================
// RUTAS PÚBLICAS (Catálogo)
// ========================================

/**
 * GET /api/games/search
 * Buscar juegos en IGDB
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ 
                message: 'El término de búsqueda debe tener al menos 2 caracteres.' 
            });
        }

        const games = await igdbService.searchGames(q, 50);

        const officialGames = games.filter(game => {
            const name = game.name.toLowerCase();
            
            const excludeKeywords = [
                'reforged', 'ascended', 'dark moon', 'randomizer',
                'lifeblood', 'pale court', 'godmaster', 'gun mod',
                ' gb', 'demake', 'fan game', 'unofficial'
            ];
            
            return !excludeKeywords.some(keyword => name.includes(keyword));
        });

        const limitedGames = officialGames.slice(0, 15);

        const formattedGames = limitedGames.map(game => {
            let coverUrl = null;
            
            if (game.cover?.image_id) {
                coverUrl = igdbService.formatCoverUrl(game.cover.image_id, 'cover_big');
            }
            
            return {
                id: game.id,
                name: game.name,
                cover: coverUrl,
                releaseDate: game.first_release_date,
                genres: game.genres?.map(g => g.name) || [],
                platforms: game.platforms?.map(p => p.name) || [],
                rating: game.rating ? Math.round(game.rating) : null,
                summary: game.summary
            };
        });

        res.json({ games: formattedGames });

    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({ message: 'Error al buscar juegos.' });
    }
});

/**
 * GET /api/games/popular
 * Obtener juegos populares
 */
router.get('/popular', async (req, res) => {
    try {
        const games = await igdbService.getPopularGames(100);
        
        const formattedGames = games.map(game => {
            let coverUrl = null;
            
            if (game.cover?.image_id) {
                coverUrl = igdbService.formatCoverUrl(game.cover.image_id, 'cover_big');
            }

            return {
                id: game.id,
                name: game.name,
                cover: coverUrl,
                releaseDate: game.first_release_date,
                genres: game.genres?.map(g => g.name) || [],
                platforms: game.platforms?.map(p => p.name) || [],
                rating: game.rating ? Math.round(game.rating) : null,
                summary: game.summary
            };
        });

        res.json({ games: formattedGames });

    } catch (error) {
        console.error('Error obteniendo juegos populares:', error);
        res.status(500).json({ message: 'Error al obtener juegos populares.' });
    }
});

// ========================================
// ⚠️ RESEÑAS PÚBLICAS - DEBE IR ANTES DE /:id
// ========================================

/**
 * GET /api/games/reviews/public
 * Obtener TODAS las reseñas públicas (sin autenticación)
 */
router.get('/reviews/public', async (req, res) => {
    try {
        const entries = await TrackerEntry.find({
            notes: { $exists: true, $ne: '' }
        })
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean();

        if (entries.length === 0) {
            return res.json({ 
                reviews: [],
                total: 0
            });
        }

        const userIds = [...new Set(entries.map(entry => entry.userId.toString()))];
        
        const users = await User.find(
            { _id: { $in: userIds } },
            { username: 1 }
        );
        
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.username;
        });
        
        const reviewsWithUsernames = entries.map(entry => ({
            ...entry,
            username: userMap[entry.userId.toString()] || 'Anónimo'
        }));

        console.log(`✅ ${reviewsWithUsernames.length} reseñas públicas obtenidas`);

        res.json({ 
            reviews: reviewsWithUsernames,
            total: reviewsWithUsernames.length
        });

    } catch (error) {
        console.error('Error obteniendo reseñas públicas:', error);
        res.status(500).json({ message: 'Error al obtener reseñas públicas.' });
    }
});

// ========================================
// RUTAS PROTEGIDAS (Biblioteca Personal)
// ========================================

/**
 * GET /api/games/library
 * Obtener toda la biblioteca del usuario
 */
router.get('/library', authMiddleware, async (req, res) => {
    try {
        const entries = await TrackerEntry.find({ userId: req.user.id })
            .sort({ updatedAt: -1 });

        const completed = entries.filter(e => e.status === 'Completado').length;
        const playing = entries.filter(e => e.status === 'Jugando').length;
        const totalHours = entries.reduce((sum, e) => sum + (e.hoursPlayed || 0), 0);

        res.json({ 
            entries,
            stats: { completed, playing, totalHours: totalHours.toFixed(1) }
        });

    } catch (error) {
        console.error('Error obteniendo biblioteca:', error);
        res.status(500).json({ message: 'Error al obtener biblioteca.' });
    }
});

/**
 * POST /api/games/library/add
 * Agregar juego a la biblioteca personal
 */
router.post('/library/add', authMiddleware, async (req, res) => {
    try {
        const { igdbId, gameName, coverUrl, platform, status, userRating, hoursPlayed, notes } = req.body;

        if (!igdbId || !gameName) {
            return res.status(400).json({ 
                message: 'El ID del juego y el nombre son obligatorios.' 
            });
        }

        const existingEntry = await TrackerEntry.findOne({
            userId: req.user.id,
            igdbId: igdbId
        });

        if (existingEntry) {
            return res.status(400).json({ 
                message: 'Este juego ya está en tu biblioteca.' 
            });
        }

        let validCoverUrl = coverUrl;
        if (coverUrl && !coverUrl.startsWith('http')) {
            validCoverUrl = coverUrl.startsWith('//') 
                ? `https:${coverUrl}` 
                : `https://${coverUrl}`;
        }

        const newEntry = new TrackerEntry({
            userId: req.user.id,
            igdbId,
            gameName,
            coverUrl: validCoverUrl,
            platform: platform || 'PC',
            status: status || 'Pendiente',
            userRating: userRating || null,
            hoursPlayed: hoursPlayed || 0,
            notes: notes || ''
        });

        await newEntry.save();

        res.status(201).json({ 
            message: 'Juego agregado a tu biblioteca.',
            entry: newEntry
        });

    } catch (error) {
        console.error('Error agregando juego a biblioteca:', error);
        res.status(500).json({ message: 'Error al agregar juego a la biblioteca.' });
    }
});

/**
 * PUT /api/games/library/:id
 * Actualizar entrada de la biblioteca
 */
router.put('/library/:id', authMiddleware, async (req, res) => {
    try {
        const { status, userRating, hoursPlayed, notes, platform } = req.body;

        const entry = await TrackerEntry.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entrada no encontrada.' });
        }

        if (status) entry.status = status;
        if (userRating !== undefined) entry.userRating = userRating;
        if (hoursPlayed !== undefined) entry.hoursPlayed = hoursPlayed;
        if (notes !== undefined) entry.notes = notes;
        if (platform) entry.platform = platform;

        await entry.save();

        res.json({ 
            message: 'Juego actualizado exitosamente.',
            entry 
        });

    } catch (error) {
        console.error('Error actualizando juego:', error);
        res.status(500).json({ message: 'Error al actualizar juego.' });
    }
});

/**
 * DELETE /api/games/library/:id
 * Eliminar juego de la biblioteca
 */
router.delete('/library/:id', authMiddleware, async (req, res) => {
    try {
        const entry = await TrackerEntry.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entrada no encontrada.' });
        }

        res.json({ message: 'Juego eliminado de tu biblioteca.' });

    } catch (error) {
        console.error('Error eliminando juego:', error);
        res.status(500).json({ message: 'Error al eliminar juego.' });
    }
});

// ========================================
// ⚠️ ESTA DEBE SER LA ÚLTIMA RUTA
// ========================================

/**
 * GET /api/games/:id
 * Obtener detalles de un juego específico
 */
router.get('/:id', async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);

        if (isNaN(gameId)) {
            return res.status(400).json({ message: 'ID de juego inválido.' });
        }

        const game = await igdbService.getGameById(gameId);

        if (!game) {
            return res.status(404).json({ message: 'Juego no encontrado.' });
        }

        let coverUrl = null;
        if (game.cover?.image_id) {
            coverUrl = igdbService.formatCoverUrl(game.cover.image_id, 'cover_big');
        }

        const formattedGame = {
            id: game.id,
            name: game.name,
            cover: coverUrl,
            releaseDate: game.first_release_date,
            genres: game.genres?.map(g => g.name) || [],
            platforms: game.platforms?.map(p => p.name) || [],
            rating: game.rating ? Math.round(game.rating) : null,
            summary: game.summary,
            storyline: game.storyline,
            screenshots: game.screenshots?.map(s => s.url) || [],
            videos: game.videos?.map(v => v.video_id) || [],
            developers: game.involved_companies
                ?.filter(ic => ic.developer)
                .map(ic => ic.company.name) || []
        };

        res.json({ game: formattedGame });

    } catch (error) {
        console.error('Error obteniendo detalles del juego:', error);
        res.status(500).json({ message: 'Error al obtener detalles del juego.' });
    }
});

module.exports = router;