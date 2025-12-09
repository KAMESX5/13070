# Backend - API REST de Pokémon

API REST desarrollada con Node.js y Express para gestionar información de Pokémon.

## 🚀 Tecnologías

- **Node.js** 20+
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **pg** - Cliente PostgreSQL para Node.js
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **express-validator** - Validación de datos

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

## 🔧 Configuración

Edita el archivo `.env` con tus configuraciones:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokemon_db
DB_USER=postgres
DB_PASSWORD=pokemon123
NODE_ENV=development
```

## 🏃 Ejecución

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:4000`

## 📚 Endpoints API

### Health Check
- **GET** `/health` - Verificar estado del servidor

### CRUD Pokémon

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pokemon` | Obtener todos los Pokémon |
| GET | `/api/pokemon/:id` | Obtener un Pokémon por ID |
| POST | `/api/pokemon` | Crear nuevo Pokémon |
| PUT | `/api/pokemon/:id` | Actualizar Pokémon |
| DELETE | `/api/pokemon/:id` | Eliminar Pokémon |

### Filtros y Búsqueda

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pokemon/tipo/:tipo` | Filtrar por tipo |
| GET | `/api/pokemon/legendarios` | Solo legendarios |
| GET | `/api/pokemon/search?nombre=pikachu` | Buscar por nombre |

## 📝 Ejemplos de Uso

### Obtener todos los Pokémon
```bash
curl http://localhost:4000/api/pokemon
```

### Crear un Pokémon
```bash
curl -X POST http://localhost:4000/api/pokemon \
  -H "Content-Type: application/json" \
  -d '{
    "numero_pokedex": 151,
    "nombre": "Mew",
    "tipo_primario": "Psíquico",
    "descripcion": "Un Pokémon legendario muy raro",
    "stats_hp": 100,
    "stats_ataque": 100,
    "stats_defensa": 100,
    "stats_velocidad": 100,
    "es_legendario": true,
    "generacion": 1
  }'
```

### Actualizar un Pokémon
```bash
curl -X PUT http://localhost:4000/api/pokemon/1 \
  -H "Content-Type: application/json" \
  -d '{
    "numero_pokedex": 6,
    "nombre": "Charizard Mejorado",
    "tipo_primario": "Fuego",
    "tipo_secundario": "Volador"
  }'
```

### Eliminar un Pokémon
```bash
curl -X DELETE http://localhost:4000/api/pokemon/1
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t pokemon-backend .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env pokemon-backend
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Configuración PostgreSQL
│   ├── controllers/
│   │   └── pokemonController.js
│   ├── models/
│   │   └── pokemonModel.js
│   ├── routes/
│   │   └── pokemonRoutes.js
│   └── server.js             # Punto de entrada
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Probar con curl
curl http://localhost:4000/health

# O usar Postman, Thunder Client, Insomnia, etc.
```

## 📄 Licencia

MIT
