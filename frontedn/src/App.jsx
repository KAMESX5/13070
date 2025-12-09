import { useState, useEffect } from 'react'
import './App.css'
import PokemonList from './components/PokemonList'
import PokemonForm from './components/PokemonForm'
import Navbar from './components/Navbar'
import Filters from './components/Filters'
import { getAllPokemon, deletePokemon } from './services/pokemonService'

function App() {
  const [pokemon, setPokemon] = useState([])
  const [filteredPokemon, setFilteredPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPokemon, setEditingPokemon] = useState(null)
  const [filters, setFilters] = useState({ type: '', legendary: 'all' })

  // Cargar todos los pokémon al inicio
  useEffect(() => {
    loadPokemon()
  }, [])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [pokemon, filters])

  const loadPokemon = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllPokemon()
      setPokemon(data)
      setFilteredPokemon(data)
    } catch (err) {
      setError('Error al cargar los Pokémon. Verifica que el backend esté corriendo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...pokemon]

    // Filtrar por tipo
    if (filters.type) {
      filtered = filtered.filter(p => 
        p.tipo_primario?.toLowerCase().includes(filters.type.toLowerCase()) ||
        p.tipo_secundario?.toLowerCase().includes(filters.type.toLowerCase())
      )
    }

    // Filtrar por legendario
    if (filters.legendary !== 'all') {
      const isLegendary = filters.legendary === 'true'
      filtered = filtered.filter(p => p.es_legendario === isLegendary)
    }

    setFilteredPokemon(filtered)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este Pokémon?')) return

    try {
      await deletePokemon(id)
      await loadPokemon()
    } catch (err) {
      alert('Error al eliminar el Pokémon')
      console.error(err)
    }
  }

  const handleEdit = (poke) => {
    setEditingPokemon(poke)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPokemon(null)
    loadPokemon()
  }

  const handleAddNew = () => {
    setEditingPokemon(null)
    setShowForm(true)
  }

  return (
    <div className="app">
      <Navbar onAddNew={handleAddNew} />
      
      <main className="container">
        <div className="header">
          <h1>🎮 Mejores Pokémon de Todos los Tiempos</h1>
          <p className="subtitle">Catálogo completo con los más poderosos y legendarios</p>
        </div>

        <Filters 
          filters={filters} 
          onFilterChange={setFilters}
          pokemonCount={filteredPokemon.length}
          totalCount={pokemon.length}
        />

        {showForm && (
          <PokemonForm 
            pokemon={editingPokemon}
            onClose={handleFormClose}
          />
        )}

        {loading ? (
          <div className="loading">
            <div className="pokeball-loader"></div>
            <p>Cargando Pokémon...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={loadPokemon}>Reintentar</button>
          </div>
        ) : (
          <PokemonList 
            pokemon={filteredPokemon}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </main>

      <footer className="footer">
        <p>Proyecto de Infraestructuras - Docker, Kubernetes & Azure Cloud</p>
        <p>© 2025 | Aplicación Web de Pokémon</p>
      </footer>
    </div>
  )
}

export default App
