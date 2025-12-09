import PokemonCard from './PokemonCard'
import './PokemonList.css'

function PokemonList({ pokemon, onDelete, onEdit }) {
  if (pokemon.length === 0) {
    return (
      <div className="empty-state">
        <p>😔 No se encontraron Pokémon con estos filtros</p>
      </div>
    )
  }

  return (
    <div className="pokemon-grid">
      {pokemon.map((poke) => (
        <PokemonCard
          key={poke.id}
          pokemon={poke}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default PokemonList
