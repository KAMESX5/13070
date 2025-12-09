import './Navbar.css'

function Navbar({ onAddNew }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="logo">⚡</span>
          <h1>PokéDex Pro</h1>
        </div>
        <button className="btn-add" onClick={onAddNew}>
          ➕ Agregar Pokémon
        </button>
      </div>
    </nav>
  )
}

export default Navbar
