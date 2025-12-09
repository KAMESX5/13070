import './Filters.css'

function Filters({ filters, onFilterChange, pokemonCount, totalCount }) {
  const handleTypeChange = (e) => {
    onFilterChange({ ...filters, type: e.target.value })
  }

  const handleLegendaryChange = (e) => {
    onFilterChange({ ...filters, legendary: e.target.value })
  }

  const clearFilters = () => {
    onFilterChange({ type: '', legendary: 'all' })
  }

  return (
    <div className="filters-container">
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="type-filter">🔍 Buscar por tipo:</label>
          <input
            id="type-filter"
            type="text"
            placeholder="Ej: Fuego, Agua, Eléctrico..."
            value={filters.type}
            onChange={handleTypeChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="legendary-filter">⭐ Legendarios:</label>
          <select
            id="legendary-filter"
            value={filters.legendary}
            onChange={handleLegendaryChange}
          >
            <option value="all">Todos</option>
            <option value="true">Solo Legendarios</option>
            <option value="false">No Legendarios</option>
          </select>
        </div>

        {(filters.type || filters.legendary !== 'all') && (
          <button className="btn-clear" onClick={clearFilters}>
            🗑️ Limpiar filtros
          </button>
        )}
      </div>

      <div className="results-count">
        <p>Mostrando <strong>{pokemonCount}</strong> de <strong>{totalCount}</strong> Pokémon</p>
      </div>
    </div>
  )
}

export default Filters
