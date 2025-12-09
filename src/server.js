/**
 * Servidor Principal - Backend API REST
 * Aplicación de Pokémon con Express.js
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const pokemonRoutes = require('./routes/pokemonRoutes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARES
// ============================================

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser - Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan - Logger de peticiones HTTP
app.use(morgan('dev'));

// ============================================
// RUTAS
// ============================================

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '¡Bienvenido a la API de Pokémon! 🎮',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      pokemon: 'GET /api/pokemon',
      pokemonById: 'GET /api/pokemon/:id',
      createPokemon: 'POST /api/pokemon',
      updatePokemon: 'PUT /api/pokemon/:id',
      deletePokemon: 'DELETE /api/pokemon/:id',
      filterByType: 'GET /api/pokemon/tipo/:tipo',
      legendarios: 'GET /api/pokemon/legendarios',
      search: 'GET /api/pokemon/search?nombre=pikachu',
    },
  });
});

// Rutas de la API
app.use('/api/pokemon', pokemonRoutes);

// ============================================
// MANEJO DE ERRORES 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.path,
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    console.log('🔄 Verificando conexión a la base de datos...');
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 SERVIDOR INICIADO EXITOSAMENTE');
      console.log('='.repeat(50));
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌍 URL: http://localhost:${PORT}`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🎮 API Pokémon: http://localhost:${PORT}/api/pokemon`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM recibido. Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recibido. Cerrando servidor gracefully...');
  process.exit(0);
});

module.exports = app;
