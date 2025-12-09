import api from './api';

// GET /api/pokemon - Obtener todos los pokémon
export const getAllPokemon = async () => {
  try {
    const response = await api.get('/pokemon');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching pokemon:', error);
    throw error;
  }
};

// GET /api/pokemon/:id - Obtener un pokémon por ID
export const getPokemonById = async (id) => {
  try {
    const response = await api.get(`/pokemon/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching pokemon by id:', error);
    throw error;
  }
};

// GET /api/pokemon/tipo/:tipo - Obtener pokémon por tipo
export const getPokemonByType = async (tipo) => {
  try {
    const response = await api.get(`/pokemon/tipo/${tipo}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching pokemon by type:', error);
    throw error;
  }
};

// GET /api/pokemon/legendarios - Obtener pokémon legendarios
export const getLegendaryPokemon = async () => {
  try {
    const response = await api.get('/pokemon/legendarios');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching legendary pokemon:', error);
    throw error;
  }
};

// POST /api/pokemon - Crear nuevo pokémon
export const createPokemon = async (pokemonData) => {
  try {
    const response = await api.post('/pokemon', pokemonData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating pokemon:', error);
    throw error;
  }
};

// PUT /api/pokemon/:id - Actualizar pokémon
export const updatePokemon = async (id, pokemonData) => {
  try {
    const response = await api.put(`/pokemon/${id}`, pokemonData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating pokemon:', error);
    throw error;
  }
};

// DELETE /api/pokemon/:id - Eliminar pokémon
export const deletePokemon = async (id) => {
  try {
    const response = await api.delete(`/pokemon/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error deleting pokemon:', error);
    throw error;
  }
};
