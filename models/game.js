// models/game.js

const mongoose = require('mongoose');

// Definir el Esquema del Juego
const gameSchema = new mongoose.Schema({
    // Referencia al usuario que posee este juego
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Hace referencia al modelo 'User'
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String,
        required: true,
        enum: ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'Otro'],
        default: 'PC'
    },
    status: {
        type: String,
        required: true,
        enum: ['Pendiente', 'En Progreso', 'Completado', 'Abandonado'],
        default: 'Pendiente'
    },
    hoursPlayed: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },
    review: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Crear un índice compuesto para asegurar que un usuario solo pueda tener un registro de un juego por título
// Esto ayuda a prevenir duplicados.
gameSchema.index({ userId: 1, title: 1 }, { unique: true });


// 2. Crear y Exportar el Modelo
const Game = mongoose.model('Game', gameSchema);

module.exports = Game;