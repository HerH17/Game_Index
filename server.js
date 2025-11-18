// server.js

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Importación del middleware de autenticación
const authenticateToken = require('./middleware/auth');
const libraryRoutes = require('./routes/library');
const gamesRoutes = require('./routes/games'); // ✅ AGREGADO

// Importación de modelos
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'TU_CLAVE_SECRETA_SUPER_SEGURA';

// -----------------------------------------------------
// MIDDLEWARES GLOBALES
// -----------------------------------------------------

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'null'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// -----------------------------------------------------
// MONTAR RUTAS DE API
// -----------------------------------------------------

// ✅ Montar rutas de juegos (IGDB + Biblioteca)
app.use('/api/games', gamesRoutes);

// ❌ COMENTADO: Ya no usamos esta ruta porque /api/games/library maneja todo
// app.use('/api/library', libraryRoutes);

// -----------------------------------------------------
// RUTAS DE AUTENTICACIÓN (LOGIN Y REGISTRO)
// -----------------------------------------------------

// RUTA DE REGISTRO
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, dob, age } = req.body;

        // Validaciones básicas
        if (!username || !email || !password || !dob || !age) {
            return res.status(400).json({ 
                message: 'Todos los campos son obligatorios.' 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'El nombre de usuario o correo ya están registrados.' 
            });
        }

        // Crear nuevo usuario
        const newUser = new User({
            username,
            email,
            password,
            dob: new Date(dob),
            age: parseInt(age)
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

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validaciones básicas
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Usuario y contraseña son obligatorios.' 
            });
        }

        // Buscar usuario en la base de datos
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ 
                message: 'Usuario o contraseña incorrectos.' 
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Usuario o contraseña incorrectos.' 
            });
        }

        // Generar token JWT
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

// -----------------------------------------------------
// INICIO DEL SERVIDOR
// -----------------------------------------------------

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