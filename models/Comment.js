// models/Comment.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // Referencia a la reseña (TrackerEntry)
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrackerEntry',
        required: true
    },
    
    // Usuario que hace el comentario
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Contenido del comentario
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, { 
    timestamps: true 
});

// Índice para buscar comentarios por reseña
commentSchema.index({ reviewId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);