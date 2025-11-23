// routes/comments.js

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Obtener comentarios de una reseña (público)
router.get('/:reviewId', async (req, res) => {
    try {
        const { reviewId } = req.params;
        
        const comments = await Comment.find({ reviewId })
            .sort({ createdAt: -1 })
            .lean();
        
        if (comments.length === 0) {
            return res.json({ comments: [] });
        }
        
        // Obtener nombres de usuarios
        const userIds = [...new Set(comments.map(c => c.userId.toString()))];
        const users = await User.find(
            { _id: { $in: userIds } },
            { username: 1 }
        );
        
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.username;
        });
        
        const commentsWithUsernames = comments.map(comment => ({
            ...comment,
            username: userMap[comment.userId.toString()] || 'Anónimo'
        }));
        
        res.json({ comments: commentsWithUsernames });
        
    } catch (error) {
        console.error('Error obteniendo comentarios:', error);
        res.status(500).json({ message: 'Error al obtener comentarios' });
    }
});

// Crear comentario (protegido)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { reviewId, content } = req.body;
        
        if (!reviewId || !content || content.trim() === '') {
            return res.status(400).json({ 
                message: 'El comentario no puede estar vacío' 
            });
        }
        
        if (content.length > 500) {
            return res.status(400).json({ 
                message: 'El comentario no puede superar los 500 caracteres' 
            });
        }
        
        const newComment = new Comment({
            reviewId,
            userId: req.user.id,
            content: content.trim()
        });
        
        await newComment.save();
        
        // Obtener username del usuario
        const user = await User.findById(req.user.id, { username: 1 });
        
        res.status(201).json({
            message: 'Comentario agregado',
            comment: {
                ...newComment.toObject(),
                username: user.username
            }
        });
        
    } catch (error) {
        console.error('Error creando comentario:', error);
        res.status(500).json({ message: 'Error al crear comentario' });
    }
});

// Eliminar comentario (solo el autor)
router.delete('/:commentId', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        
        const comment = await Comment.findOneAndDelete({
            _id: commentId,
            userId: req.user.id
        });
        
        if (!comment) {
            return res.status(404).json({ 
                message: 'Comentario no encontrado o no tienes permiso para eliminarlo' 
            });
        }
        
        res.json({ message: 'Comentario eliminado' });
        
    } catch (error) {
        console.error('Error eliminando comentario:', error);
        res.status(500).json({ message: 'Error al eliminar comentario' });
    }
});

module.exports = router;