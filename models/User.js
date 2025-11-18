// models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
// (Ya no necesitamos jwt ni JWT_SECRET aquí)

// 1. Definir el Esquema del Usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    dob: { // Fecha de Nacimiento
        type: Date, 
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 13
    }
}, { timestamps: true }); 

// 2. Middleware para Hashear la Contraseña
userSchema.pre('save', async function (next) {
    const user = this;
    
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10); 
        user.password = await bcrypt.hash(user.password, salt); 
    }

    next();
});


// 3. Método para Comparar Contraseñas durante el Login
userSchema.methods.comparePassword = async function (candidatePassword) {
    // 'this.password' es la contraseña hasheada guardada en MongoDB
    return bcrypt.compare(candidatePassword, this.password);
};

// 4. Crear el Modelo (UNA SOLA VEZ)
const User = mongoose.model('User', userSchema); // ⬅️ ¡ÚNICA DECLARACIÓN!

module.exports = User;