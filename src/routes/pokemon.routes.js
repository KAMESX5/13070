const express = require('express');
const router = express.Router();
const PokemonController = require('../controllers/pokemon.controller');

// GET routes
router.get('/', PokemonController.getAll);
router.get('/legendarios', PokemonController.getLegendarios);
router.get('/tipo/:tipo', PokemonController.getByType);
router.get('/:id', PokemonController.getById);

// POST route
router.post('/', PokemonController.create);

// PUT route
router.put('/:id', PokemonController.update);

// DELETE route
router.delete('/:id', PokemonController.delete);

module.exports = router;
