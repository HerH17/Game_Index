const jwt = require('jsonwebtoken');

// **CRÍTICO:** DEBES copiar la clave exacta que usas en server.js aquí.
const JWT_SECRET = 'TU_CLAVE_SECRETA_SUPER_SEGURA'; 

const authMiddleware = (req, res, next)=> {
    // CORRECCIÓN: Usamos 'Authorization' para que el Back-end entienda al Front-end.
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        return res.status(401).json({message: 'Acceso denegado. Token no proporcionado. '});
    }

    try{
        // Usa la clave secreta para verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {id: decoded.id};

        next();
    } catch(error){
        // res.status(401) en lugar de req.status(401)
        res.status(401).json({message: 'Token invalido o expirado. '});
    }
}; 

module.exports = authMiddleware;