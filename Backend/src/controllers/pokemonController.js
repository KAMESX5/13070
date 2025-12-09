/**
 * Controlador de Pokémon
 * Maneja la lógica de negocio y respuestas HTTP
 */

const PokemonModel = require('../models/pokemonModel');
const { validationResult } = require('express-validator');

class PokemonController {
  /**
   * GET /api/pokemon - Obtener todos los Pokémon
   */
  static async getAll(req, res) {
    try {
      const pokemon = await PokemonModel.getAll();
      res.status(200).json({
        success: true,
        count: pokemon.length,
        data: pokemon,
      });
    } catch (error) {
      console.error('Error al obtener Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de Pokémon',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pokemon/:id - Obtener un Pokémon por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const pokemon = await PokemonModel.getById(id);

      if (!pokemon) {
        return res.status(404).json({
          success: false,
          message: `Pokémon con ID ${id} no encontrado`,
        });
      }

      res.status(200).json({
        success: true,
        data: pokemon,
      });
    } catch (error) {
      console.error('Error al obtener Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el Pokémon',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/pokemon - Crear un nuevo Pokémon
   */
  static async create(req, res) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array(),
        });
      }

      // Verificar si ya existe un Pokémon con ese número de Pokédex
      const existing = await PokemonModel.getByPokedexNumber(req.body.numero_pokedex);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Ya existe un Pokémon con el número de Pokédex ${req.body.numero_pokedex}`,
        });
      }

      const newPokemon = await PokemonModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Pokémon creado exitosamente',
        data: newPokemon,
      });
    } catch (error) {
      console.error('Error al crear Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el Pokémon',
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/pokemon/:id - Actualizar un Pokémon
   */
  static async update(req, res) {
    try {
      const { id } = req.params;

      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array(),
        });
      }

      // Verificar si el Pokémon existe
      const existing = await PokemonModel.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Pokémon con ID ${id} no encontrado`,
        });
      }

      // Verificar si el nuevo número de Pokédex ya está en uso por otro Pokémon
      if (req.body.numero_pokedex && req.body.numero_pokedex !== existing.numero_pokedex) {
        const duplicate = await PokemonModel.getByPokedexNumber(req.body.numero_pokedex);
        if (duplicate && duplicate.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: `El número de Pokédex ${req.body.numero_pokedex} ya está en uso`,
          });
        }
      }

      const updatedPokemon = await PokemonModel.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Pokémon actualizado exitosamente',
        data: updatedPokemon,
      });
    } catch (error) {
      console.error('Error al actualizar Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el Pokémon',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/pokemon/:id - Eliminar un Pokémon
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedPokemon = await PokemonModel.delete(id);

      if (!deletedPokemon) {
        return res.status(404).json({
          success: false,
          message: `Pokémon con ID ${id} no encontrado`,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Pokémon eliminado exitosamente',
        data: deletedPokemon,
      });
    } catch (error) {
      console.error('Error al eliminar Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el Pokémon',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pokemon/tipo/:tipo - Filtrar por tipo
   */
  static async getByType(req, res) {
    try {
      const { tipo } = req.params;
      const pokemon = await PokemonModel.getByType(tipo);

      res.status(200).json({
        success: true,
        count: pokemon.length,
        data: pokemon,
      });
    } catch (error) {
      console.error('Error al filtrar Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al filtrar Pokémon por tipo',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pokemon/legendarios - Obtener solo legendarios
   */
  static async getLegendarios(req, res) {
    try {
      const pokemon = await PokemonModel.getLegendarios();

      res.status(200).json({
        success: true,
        count: pokemon.length,
        data: pokemon,
      });
    } catch (error) {
      console.error('Error al obtener Pokémon legendarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener Pokémon legendarios',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pokemon/search?nombre=pikachu - Buscar por nombre
   */
  static async searchByName(req, res) {
    try {
      const { nombre } = req.query;

      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "nombre" es requerido',
        });
      }

      const pokemon = await PokemonModel.searchByName(nombre);

      res.status(200).json({
        success: true,
        count: pokemon.length,
        data: pokemon,
      });
    } catch (error) {
      console.error('Error al buscar Pokémon:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar Pokémon',
        error: error.message,
      });
    }
  }
}

module.exports = PokemonController;
