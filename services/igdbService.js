// services/igdbService.js - ✅ CORREGIDO

const axios = require('axios');

class IGDBService {
    constructor() {
        this.clientId = process.env.TWITCH_CLIENT_ID;
        this.clientSecret = process.env.TWITCH_CLIENT_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Obtiene un access token de Twitch OAuth
     */
    async getAccessToken() {
        // Si ya tenemos un token válido, usarlo
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                params: {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'client_credentials'
                }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Error obteniendo access token:', error.response?.data || error.message);
            throw new Error('No se pudo autenticar con IGDB');
        }
    }

    /**
     * Búsqueda de juegos por nombre
     * @param {string} query - Término de búsqueda
     * @param {number} limit - Número de resultados (default: 10)
     */
    async searchGames(query, limit = 10) {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                'https://api.igdb.com/v4/games',
                `
                search "${query}";
                fields name, cover.image_id, first_release_date, genres.name, platforms.name, rating, summary;
                limit ${limit};
                `,
                {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error buscando juegos:', error.response?.data || error.message);
            throw new Error('Error al buscar juegos en IGDB');
        }
    }

    /**
     * Obtener detalles de un juego específico por ID
     * @param {number} gameId - ID del juego en IGDB
     */
    async getGameById(gameId) {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                'https://api.igdb.com/v4/games',
                `
                fields name, cover.image_id, first_release_date, genres.name, platforms.name, 
                       rating, summary, storyline, screenshots.url, videos.video_id, 
                       involved_companies.company.name, involved_companies.developer;
                where id = ${gameId};
                `,
                {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );

            return response.data[0];
        } catch (error) {
            console.error('Error obteniendo detalles del juego:', error.response?.data || error.message);
            throw new Error('Error al obtener detalles del juego');
        }
    }

    /**
     * Obtener juegos populares
     * @param {number} limit - Número de resultados
     */
    async getPopularGames(limit = 20) {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                'https://api.igdb.com/v4/games',
                `
                fields name, cover.image_id, first_release_date, genres.name, rating, summary;
                where rating > 80 & rating_count > 50;
                sort rating desc;
                limit ${limit};
                `,
                {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error obteniendo juegos populares:', error.response?.data || error.message);
            throw new Error('Error al obtener juegos populares');
        }
    }

    /**
     * ✅ Formatea la URL de la portada del juego
     * @param {string} imageId - ID de imagen de IGDB (ej: "co1rbs")
     * @param {string} size - Tamaño (thumb, cover_small, cover_big, 720p, 1080p)
     * @returns {string|null} - URL completa y correcta
     */
    formatCoverUrl(imageId, size = 'cover_big') {
        if (!imageId) return null;
        
        // ✅ Retornar URL COMPLETA con https://
        return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
    }
}

module.exports = new IGDBService();