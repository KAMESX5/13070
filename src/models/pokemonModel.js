/**
 * Modelo de Pokémon
 * Maneja todas las operaciones de base de datos relacionadas con Pokémon
 */

const { pool } = require('../config/database');

class PokemonModel {
  /**
   * Obtener todos los Pokémon
   */
  static async getAll() {
    const query = `
      SELECT * FROM pokemon 
      ORDER BY numero_pokedex ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener un Pokémon por ID
   */
  static async getById(id) {
    const query = 'SELECT * FROM pokemon WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Obtener Pokémon por número de Pokédex
   */
  static async getByPokedexNumber(numero) {
    const query = 'SELECT * FROM pokemon WHERE numero_pokedex = $1';
    const result = await pool.query(query, [numero]);
    return result.rows[0];
  }

  /**
   * Crear un nuevo Pokémon
   */
  static async create(pokemonData) {
    const {
      numero_pokedex,
      nombre,
      tipo_primario,
      tipo_secundario,
      descripcion,
      stats_hp,
      stats_ataque,
      stats_defensa,
      stats_velocidad,
      imagen_url,
      es_legendario,
      generacion,
    } = pokemonData;

    const query = `
      INSERT INTO pokemon (
        numero_pokedex, nombre, tipo_primario, tipo_secundario,
        descripcion, stats_hp, stats_ataque, stats_defensa, stats_velocidad,
        imagen_url, es_legendario, generacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      numero_pokedex,
      nombre,
      tipo_primario,
      tipo_secundario || null,
      descripcion || null,
      stats_hp || null,
      stats_ataque || null,
      stats_defensa || null,
      stats_velocidad || null,
      imagen_url || null,
      es_legendario || false,
      generacion || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Actualizar un Pokémon existente
   */
  static async update(id, pokemonData) {
    const {
      numero_pokedex,
      nombre,
      tipo_primario,
      tipo_secundario,
      descripcion,
      stats_hp,
      stats_ataque,
      stats_defensa,
      stats_velocidad,
      imagen_url,
      es_legendario,
      generacion,
    } = pokemonData;

    const query = `
      UPDATE pokemon SET
        numero_pokedex = $1,
        nombre = $2,
        tipo_primario = $3,
        tipo_secundario = $4,
        descripcion = $5,
        stats_hp = $6,
        stats_ataque = $7,
        stats_defensa = $8,
        stats_velocidad = $9,
        imagen_url = $10,
        es_legendario = $11,
        generacion = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      numero_pokedex,
      nombre,
      tipo_primario,
      tipo_secundario || null,
      descripcion || null,
      stats_hp || null,
      stats_ataque || null,
      stats_defensa || null,
      stats_velocidad || null,
      imagen_url || null,
      es_legendario || false,
      generacion || null,
      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar un Pokémon
   */
  static async delete(id) {
    const query = 'DELETE FROM pokemon WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Filtrar Pokémon por tipo
   */
  static async getByType(tipo) {
    const query = `
      SELECT * FROM pokemon 
      WHERE LOWER(tipo_primario) = LOWER($1) OR LOWER(tipo_secundario) = LOWER($1)
      ORDER BY numero_pokedex ASC
    `;
    const result = await pool.query(query, [tipo]);
    return result.rows;
  }

  /**
   * Obtener solo Pokémon legendarios
   */
  static async getLegendarios() {
    const query = `
      SELECT * FROM pokemon 
      WHERE es_legendario = true
      ORDER BY numero_pokedex ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Buscar Pokémon por nombre (búsqueda parcial)
   */
  static async searchByName(nombre) {
    const query = `
      SELECT * FROM pokemon 
      WHERE LOWER(nombre) LIKE LOWER($1)
      ORDER BY numero_pokedex ASC
    `;
    const result = await pool.query(query, [`%${nombre}%`]);
    return result.rows;
  }
}

module.exports = PokemonModel;
