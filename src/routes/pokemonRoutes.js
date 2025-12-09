/**
 * Rutas de la API de Pokémon
 * Define todos los endpoints disponibles
 */

const express = require('express');
const router = express.Router();
const PokemonController = require('../controllers/pokemonController');
const { body } = require('express-validator');

// Validaciones para crear/actualizar Pokémon
const pokemonValidation = [
  body('numero_pokedex')
    .isInt({ min: 1, max: 9999 })
    .withMessage('El número de Pokédex debe ser un entero entre 1 y 9999'),
  body('nombre')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre es requerido y debe tener máximo 100 caracteres'),
  body('tipo_primario')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El tipo primario es requerido'),
  body('tipo_secundario')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El tipo secundario debe tener máximo 50 caracteres'),
  body('stats_hp')
    .optional()
    .isInt({ min: 0, max: 255 })
    .withMessage('HP debe ser un entero entre 0 y 255'),
  body('stats_ataque')
    .optional()
    .isInt({ min: 0, max: 255 })
    .withMessage('Ataque debe ser un entero entre 0 y 255'),
  body('stats_defensa')
    .optional()
    .isInt({ min: 0, max: 255 })
    .withMessage('Defensa debe ser un entero entre 0 y 255'),
  body('stats_velocidad')
    .optional()
    .isInt({ min: 0, max: 255 })
    .withMessage('Velocidad debe ser un entero entre 0 y 255'),
  body('es_legendario')
    .optional()
    .isBoolean()
    .withMessage('es_legendario debe ser booleano'),
  body('generacion')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Generación debe ser un entero entre 1 y 9'),
];

// ============================================
// RUTAS ESPECIALES (deben ir antes de :id)
// ============================================

// GET /api/pokemon/legendarios - Obtener solo legendarios
router.get('/legendarios', PokemonController.getLegendarios);

// GET /api/pokemon/search?nombre=pikachu - Buscar por nombre
router.get('/search', PokemonController.searchByName);

// GET /api/pokemon/tipo/:tipo - Filtrar por tipo
router.get('/tipo/:tipo', PokemonController.getByType);

// ============================================
// RUTAS CRUD PRINCIPALES
// ============================================

// GET /api/pokemon - Obtener todos los Pokémon
router.get('/', PokemonController.getAll);

// GET /api/pokemon/:id - Obtener un Pokémon por ID
router.get('/:id', PokemonController.getById);

// POST /api/pokemon - Crear un nuevo Pokémon
router.post('/', pokemonValidation, PokemonController.create);

// PUT /api/pokemon/:id - Actualizar un Pokémon
router.put('/:id', pokemonValidation, PokemonController.update);

// DELETE /api/pokemon/:id - Eliminar un Pokémon
router.delete('/:id', PokemonController.delete);

module.exports = router;
