const PokemonModel = require('../models/pokemon.model');

class PokemonController {
  // GET /api/pokemon
  static async getAll(req, res) {
    try {
      const pokemon = await PokemonModel.getAll();
      res.json({
        success: true,
        count: pokemon.length,
        data: pokemon
      });
    } catch (error) {
      console.error('Error getting all pokemon:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving pokemon' 
      });
    }
  }

  // GET /api/pokemon/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const pokemon = await PokemonModel.getById(id);
      
      if (!pokemon) {
        return res.status(404).json({ 
          success: false, 
          error: 'Pokemon not found' 
        });
      }
      
      res.json({
        success: true,
        data: pokemon
      });
    } catch (error) {
      console.error('Error getting pokemon by id:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving pokemon' 
      });
    }
  }

  // GET /api/pokemon/tipo/:tipo
  static async getByType(req, res) {
    try {
      const { tipo } = req.params;
      const pokemon = await PokemonModel.getByType(tipo);
      
      res.json({
        success: true,
        count: pokemon.length,
        data: pokemon
      });
    } catch (error) {
      console.error('Error getting pokemon by type:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving pokemon by type' 
      });
    }
  }

  // GET /api/pokemon/legendarios
  static async getLegendarios(req, res) {
    try {
      const pokemon = await PokemonModel.getLegendarios();
      
      res.json({
        success: true,
        count: pokemon.length,
        data: pokemon
      });
    } catch (error) {
      console.error('Error getting legendary pokemon:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving legendary pokemon' 
      });
    }
  }

  // POST /api/pokemon
  static async create(req, res) {
    try {
      const pokemonData = req.body;
      
      // Basic validation
      if (!pokemonData.numero_pokedex || !pokemonData.nombre || !pokemonData.tipo_primario) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: numero_pokedex, nombre, tipo_primario' 
        });
      }
      
      const newPokemon = await PokemonModel.create(pokemonData);
      
      res.status(201).json({
        success: true,
        message: 'Pokemon created successfully',
        data: newPokemon
      });
    } catch (error) {
      console.error('Error creating pokemon:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ 
          success: false, 
          error: 'Pokemon with this numero_pokedex already exists' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Error creating pokemon' 
      });
    }
  }

  // PUT /api/pokemon/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const pokemonData = req.body;
      
      // Check if pokemon exists
      const existingPokemon = await PokemonModel.getById(id);
      if (!existingPokemon) {
        return res.status(404).json({ 
          success: false, 
          error: 'Pokemon not found' 
        });
      }
      
      const updatedPokemon = await PokemonModel.update(id, pokemonData);
      
      res.json({
        success: true,
        message: 'Pokemon updated successfully',
        data: updatedPokemon
      });
    } catch (error) {
      console.error('Error updating pokemon:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error updating pokemon' 
      });
    }
  }

  // DELETE /api/pokemon/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deletedPokemon = await PokemonModel.delete(id);
      
      if (!deletedPokemon) {
        return res.status(404).json({ 
          success: false, 
          error: 'Pokemon not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Pokemon deleted successfully',
        data: deletedPokemon
      });
    } catch (error) {
      console.error('Error deleting pokemon:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error deleting pokemon' 
      });
    }
  }
}

module.exports = PokemonController;
