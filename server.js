// server.js - CON RUTAS DE CONFIGURACIÓN

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const cors = require('cors');
const jwt = require('jsonwebtoken');

const authenticateToken = require('./middleware/auth');
const gamesRoutes = require('./routes/games');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'TU_CLAVE_SECRETA_SUPER_SEGURA';

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'null'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Rutas de juegos
app.use('/api/games', gamesRoutes);

// ========================================
// RUTAS DE USUARIO (CONFIGURACIÓN)
// ========================================

// Obtener perfil del usuario
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// Actualizar información personal
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { email, dob, age } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (email) user.email = email;
        if (dob) user.dob = new Date(dob);
        if (age) user.age = age;

        await user.save();

        res.json({ message: 'Perfil actualizado correctamente', user });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
});

// Cambiar contraseña
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const isValid = await user.comparePassword(currentPassword);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
});

// Guardar preferencias
app.put('/api/user/preferences', authenticateToken, async (req, res) => {
    try {
        const { favoritePlatform, favoriteGenre, publicProfile, emailNotifications } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.preferences = {
            favoritePlatform,
            favoriteGenre,
            publicProfile,
            emailNotifications
        };

        await user.save();

        res.json({ message: 'Preferencias guardadas correctamente' });
    } catch (error) {
        console.error('Error guardando preferencias:', error);
        res.status(500).json({ message: 'Error al guardar preferencias' });
    }
});

// Eliminar cuenta
app.delete('/api/user/delete', authenticateToken, async (req, res) => {
    try {
        const TrackerEntry = require('./models/trackerEntry');
        
        // Eliminar todas las entradas del usuario
        await TrackerEntry.deleteMany({ userId: req.user.id });
        
        // Eliminar usuario
        await User.findByIdAndDelete(req.user.id);

        res.json({ message: 'Cuenta eliminada correctamente' });
    } catch (error) {
        console.error('Error eliminando cuenta:', error);
        res.status(500).json({ message: 'Error al eliminar cuenta' });
    }
});

// ========================================
// AUTENTICACIÓN
// ========================================

app.post('/register', async (req, res) => {
    try {
        const { username, email, password, dob, age } = req.body;

        if (!username || !email || !password || !dob || !age) {
            return res.status(400).json({ 
                message: 'Todos los campos son obligatorios.' 
            });
        }

        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'El nombre de usuario o correo ya están registrados.' 
            });
        }

        const newUser = new User({
            username,
            email,
            password,
            dob: new Date(dob),
            age: parseInt(age),
            preferences: {
                publicProfile: true,
                emailNotifications: true
            }
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente.',
            username: newUser.username 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor al registrar usuario.' 
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Usuario y contraseña son obligatorios.' 
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ 
                message: 'Usuario o contraseña incorrectos.' 
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Usuario o contraseña incorrectos.' 
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            username: user.username
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor al iniciar sesión.' 
        });
    }
});

// ========================================
// INICIO DEL SERVIDOR
// ========================================

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gameindex')
    .then(() => {
        console.log('✅ Conectado a MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Error de conexión a MongoDB:', err);
    });