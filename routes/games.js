// routes/games.js

const express = require('express');
const router = express.Router();
const igdbService = require('../services/igdbService');
const TrackerEntry = require('../models/trackerEntry');
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

        // Filtrar contenido no oficial (mods, actualizaciones gratuitas)
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
                console.log(`✅ Cover generada: ${game.name} -> ${coverUrl}`);
            } else {
                console.log(`⚠️  Sin portada: ${game.name} (cover: ${JSON.stringify(game.cover)})`);
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

        console.log(`📊 Resultados: ${formattedGames.length} juegos (${formattedGames.filter(g => g.cover).length} con portada)`);
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
<<<<<<< HEAD
        const games = await igdbService.getPopularGames(100);
=======
        const games = await igdbService.getPopularGames(20);
>>>>>>> 6043dcf34de6497e2a82975ca57596b01df47496

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