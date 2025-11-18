// cleanupDatabase.js - EJECUTAR UNA SOLA VEZ
// Este script limpiará los índices duplicados y corregirá URLs mal formateadas

require('dotenv').config();
const mongoose = require('mongoose');
const TrackerEntry = require('./models/trackerEntry');

async function cleanup() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // 1. Eliminar todos los índices existentes (excepto _id)
        console.log('🔧 Eliminando índices antiguos...');
        await TrackerEntry.collection.dropIndexes();
        console.log('✅ Índices eliminados');

        // 2. Recrear el índice correcto
        console.log('🔧 Creando índice correcto...');
        await TrackerEntry.collection.createIndex(
            { userId: 1, igdbId: 1 }, 
            { unique: true }
        );
        console.log('✅ Índice único creado: { userId: 1, igdbId: 1 }');

        // 3. Corregir URLs mal formateadas en los documentos existentes
        console.log('🔧 Corrigiendo URLs de imágenes...');
        
        const entries = await TrackerEntry.find({});
        let correctedCount = 0;

        for (const entry of entries) {
            if (entry.coverUrl && entry.coverUrl.startsWith('//')) {
                // Agregar https: al inicio
                entry.coverUrl = `https:${entry.coverUrl}`;
                await entry.save();
                correctedCount++;
            } else if (entry.coverUrl && !entry.coverUrl.startsWith('http')) {
                // Si no tiene protocolo, agregar https://
                entry.coverUrl = `https://${entry.coverUrl}`;
                await entry.save();
                correctedCount++;
            }
        }

        console.log(`✅ ${correctedCount} URLs corregidas`);
        console.log(`📊 Total de juegos en biblioteca: ${entries.length}`);

        // 4. Mostrar estadísticas
        const stats = await TrackerEntry.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 Estadísticas por usuario:');
        stats.forEach(stat => {
            console.log(`   Usuario ${stat._id}: ${stat.count} juegos`);
        });

        console.log('\n✅ Limpieza completada exitosamente');
        
        await mongoose.connection.close();
        console.log('🔌 Desconectado de MongoDB');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        process.exit(1);
    }
}

// Ejecutar la limpieza
cleanup();