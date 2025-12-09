import { useState, useEffect } from 'react'
import { createPokemon, updatePokemon } from '../services/pokemonService'
import './PokemonForm.css'

function PokemonForm({ pokemon, onClose }) {
  const [formData, setFormData] = useState({
    numero_pokedex: '',
    nombre: '',
    tipo_primario: '',
    tipo_secundario: '',
    descripcion: '',
    stats_hp: '',
    stats_ataque: '',
    stats_defensa: '',
    stats_velocidad: '',
    imagen_url: '',
    es_legendario: false,
    generacion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (pokemon) {
      setFormData(pokemon)
    }
  }, [pokemon])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convertir strings a números
      const dataToSend = {
        ...formData,
        numero_pokedex: parseInt(formData.numero_pokedex),
        stats_hp: parseInt(formData.stats_hp),
        stats_ataque: parseInt(formData.stats_ataque),
        stats_defensa: parseInt(formData.stats_defensa),
        stats_velocidad: parseInt(formData.stats_velocidad),
        generacion: parseInt(formData.generacion)
      }

      if (pokemon) {
        await updatePokemon(pokemon.id, dataToSend)
      } else {
        await createPokemon(dataToSend)
      }

      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el Pokémon')
    } finally {
      setLoading(false)
    }
  }

  const tipos = [
    'Fuego', 'Agua', 'Planta', 'Eléctrico', 'Psíquico', 'Hielo',
    'Dragón', 'Siniestro', 'Hada', 'Normal', 'Lucha', 'Volador',
    'Veneno', 'Tierra', 'Roca', 'Bicho', 'Fantasma', 'Acero'
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{pokemon ? '✏️ Editar Pokémon' : '➕ Agregar Nuevo Pokémon'}</h2>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="pokemon-form">
          {error && <div className="error-alert">{error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numero_pokedex">Número Pokédex *</label>
              <input
                id="numero_pokedex"
                type="number"
                name="numero_pokedex"
                value={formData.numero_pokedex}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_primario">Tipo Primario *</label>
              <select
                id="tipo_primario"
                name="tipo_primario"
                value={formData.tipo_primario}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un tipo</option>
                {tipos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipo_secundario">Tipo Secundario</label>
              <select
                id="tipo_secundario"
                name="tipo_secundario"
                value={formData.tipo_secundario}
                onChange={handleChange}
              >
                <option value="">Ninguno</option>
                {tipos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="generacion">Generación *</label>
              <input
                id="generacion"
                type="number"
                name="generacion"
                value={formData.generacion}
                onChange={handleChange}
                required
                min="1"
                max="9"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="es_legendario"
                  checked={formData.es_legendario}
                  onChange={handleChange}
                />
                <span>⭐ Es Legendario</span>
              </label>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="imagen_url">URL de Imagen</label>
            <input
              id="imagen_url"
              type="url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="stats-section">
            <h3>📊 Estadísticas</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="stats_hp">HP *</label>
                <input
                  id="stats_hp"
                  type="number"
                  name="stats_hp"
                  value={formData.stats_hp}
                  onChange={handleChange}
                  required
                  min="1"
                  max="255"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stats_ataque">Ataque *</label>
                <input
                  id="stats_ataque"
                  type="number"
                  name="stats_ataque"
                  value={formData.stats_ataque}
                  onChange={handleChange}
                  required
                  min="1"
                  max="255"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stats_defensa">Defensa *</label>
                <input
                  id="stats_defensa"
                  type="number"
                  name="stats_defensa"
                  value={formData.stats_defensa}
                  onChange={handleChange}
                  required
                  min="1"
                  max="255"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stats_velocidad">Velocidad *</label>
                <input
                  id="stats_velocidad"
                  type="number"
                  name="stats_velocidad"
                  value={formData.stats_velocidad}
                  onChange={handleChange}
                  required
                  min="1"
                  max="255"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : pokemon ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PokemonForm
