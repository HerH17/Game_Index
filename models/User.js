// models/User.js - CON PREFERENCIAS

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    dob: {
        type: Date, 
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 13
    },
    preferences: {
        favoritePlatform: {
            type: String,
            default: ''
        },
        favoriteGenre: {
            type: String,
            default: ''
        },
        publicProfile: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    const user = this;
    
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10); 
        user.password = await bcrypt.hash(user.password, salt); 
    }

    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;