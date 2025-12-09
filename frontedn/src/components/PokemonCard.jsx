import './PokemonCard.css'

function PokemonCard({ pokemon, onDelete, onEdit }) {
  const {
    id,
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
    generacion
  } = pokemon

  const getTypeColor = (type) => {
    const colors = {
      'Fuego': '#F08030',
      'Agua': '#6890F0',
      'Planta': '#78C850',
      'Eléctrico': '#F8D030',
      'Psíquico': '#F85888',
      'Hielo': '#98D8D8',
      'Dragón': '#7038F8',
      'Siniestro': '#705848',
      'Hada': '#EE99AC',
      'Normal': '#A8A878',
      'Lucha': '#C03028',
      'Volador': '#A890F0',
      'Veneno': '#A040A0',
      'Tierra': '#E0C068',
      'Roca': '#B8A038',
      'Bicho': '#A8B820',
      'Fantasma': '#705898',
      'Acero': '#B8B8D0'
    }
    return colors[type] || '#68A090'
  }

  return (
    <div className={`pokemon-card ${es_legendario ? 'legendary' : ''}`}>
      {es_legendario && <div className="legendary-badge">⭐ LEGENDARIO</div>}
      
      <div className="card-header">
        <span className="pokedex-number">#{numero_pokedex.toString().padStart(3, '0')}</span>
        <span className="generation">Gen {generacion}</span>
      </div>

      <div className="card-image">
        <img 
          src={imagen_url || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'} 
          alt={nombre}
          onError={(e) => {
            e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
          }}
        />
      </div>

      <div className="card-body">
        <h3 className="pokemon-name">{nombre}</h3>
        
        <div className="types">
          <span 
            className="type-badge" 
            style={{ backgroundColor: getTypeColor(tipo_primario) }}
          >
            {tipo_primario}
          </span>
          {tipo_secundario && (
            <span 
              className="type-badge"
              style={{ backgroundColor: getTypeColor(tipo_secundario) }}
            >
              {tipo_secundario}
            </span>
          )}
        </div>

        <p className="description">{descripcion}</p>

        <div className="stats">
          <div className="stat">
            <span className="stat-label">HP</span>
            <div className="stat-bar">
              <div 
                className="stat-fill" 
                style={{ width: `${(stats_hp / 255) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{stats_hp}</span>
          </div>

          <div className="stat">
            <span className="stat-label">ATK</span>
            <div className="stat-bar">
              <div 
                className="stat-fill" 
                style={{ width: `${(stats_ataque / 255) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{stats_ataque}</span>
          </div>

          <div className="stat">
            <span className="stat-label">DEF</span>
            <div className="stat-bar">
              <div 
                className="stat-fill" 
                style={{ width: `${(stats_defensa / 255) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{stats_defensa}</span>
          </div>

          <div className="stat">
            <span className="stat-label">SPD</span>
            <div className="stat-bar">
              <div 
                className="stat-fill" 
                style={{ width: `${(stats_velocidad / 255) * 100}%` }}
              ></div>
            </div>
            <span className="stat-value">{stats_velocidad}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-edit" onClick={() => onEdit(pokemon)}>
          ✏️ Editar
        </button>
        <button className="btn-delete" onClick={() => onDelete(id)}>
          🗑️ Eliminar
        </button>
      </div>
    </div>
  )
}

export default PokemonCard
