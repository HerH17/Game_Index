// models/trackerEntry.js - ✅ CORREGIDO

const mongoose = require('mongoose');

const TrackerEntrySchema = new mongoose.Schema({
    // Referencia al usuario
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Información del juego desde IGDB
    igdbId: {
        type: Number,
        required: true
    },

    gameName: {
        type: String,
        required: true
    },

    coverUrl: {
        type: String
    },

    platform: {
        type: String,
        default: 'PC'
    },

    // Estado de seguimiento del usuario
    status: {
        type: String,
        required: true,
        enum: ['Pendiente', 'Jugando', 'Completado', 'Abandonado', 'Deseado'],
        default: 'Pendiente'
    },

    // Puntuación del usuario (1-5 estrellas o 1-10)
    userRating: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },

    // Horas jugadas
    hoursPlayed: {
        type: Number,
        default: 0,
        min: 0
    },

    // Notas personales del usuario
    notes: {
        type: String,
        default: ''
    },

    // Review completa (opcional, para el sistema de reseñas futuro)
    review: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

// ✅ FIX 3: Índice único CORRECTO
// Esto permite que un mismo usuario agregue MÚLTIPLES juegos diferentes
// pero NO puede agregar el MISMO juego DOS VECES
TrackerEntrySchema.index({ userId: 1, igdbId: 1 }, { unique: true });

module.exports = mongoose.model('TrackerEntry', TrackerEntrySchema);