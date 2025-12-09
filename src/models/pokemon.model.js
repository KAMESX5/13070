const pool = require('../config/database');

class PokemonModel {
  // Get all pokemon
  static async getAll() {
    const query = 'SELECT * FROM pokemon ORDER BY numero_pokedex ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get pokemon by ID
  static async getById(id) {
    const query = 'SELECT * FROM pokemon WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get pokemon by type
  static async getByType(tipo) {
    const query = `
      SELECT * FROM pokemon 
      WHERE tipo_primario ILIKE $1 OR tipo_secundario ILIKE $1
      ORDER BY numero_pokedex ASC
    `;
    const result = await pool.query(query, [tipo]);
    return result.rows;
  }

  // Get legendary pokemon
  static async getLegendarios() {
    const query = 'SELECT * FROM pokemon WHERE es_legendario = true ORDER BY numero_pokedex ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Create new pokemon
  static async create(pokemonData) {
    const query = `
      INSERT INTO pokemon (
        numero_pokedex, nombre, tipo_primario, tipo_secundario,
        descripcion, stats_hp, stats_ataque, stats_defensa, stats_velocidad,
        imagen_url, es_legendario, generacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      pokemonData.numero_pokedex,
      pokemonData.nombre,
      pokemonData.tipo_primario,
      pokemonData.tipo_secundario || null,
      pokemonData.descripcion,
      pokemonData.stats_hp,
      pokemonData.stats_ataque,
      pokemonData.stats_defensa,
      pokemonData.stats_velocidad,
      pokemonData.imagen_url,
      pokemonData.es_legendario || false,
      pokemonData.generacion
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update pokemon
  static async update(id, pokemonData) {
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
      pokemonData.numero_pokedex,
      pokemonData.nombre,
      pokemonData.tipo_primario,
      pokemonData.tipo_secundario || null,
      pokemonData.descripcion,
      pokemonData.stats_hp,
      pokemonData.stats_ataque,
      pokemonData.stats_defensa,
      pokemonData.stats_velocidad,
      pokemonData.imagen_url,
      pokemonData.es_legendario || false,
      pokemonData.generacion,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete pokemon
  static async delete(id) {
    const query = 'DELETE FROM pokemon WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = PokemonModel;
