# 🎮 Aplicación Web de Mejores Pokémon

> Proyecto académico de Infraestructuras con Docker, Kubernetes y Azure Cloud

Aplicación web full-stack profesional que muestra un catálogo de los mejores Pokémon de todos los tiempos, con arquitectura de microservicios y despliegue en múltiples entornos.

## 📋 Características

✅ **Frontend React** - Interfaz moderna y responsive con Vite
✅ **Backend Node.js** - API REST completa con Express
✅ **Base de Datos PostgreSQL** - Almacenamiento persistente
✅ **API REST Completa** - CRUD + filtros y búsquedas
✅ **Docker Compose** - Despliegue local con contenedores
✅ **Kubernetes** - Orquestación y escalabilidad
✅ **Azure Cloud** - Despliegue en la nube con Load Balancer

## 🏗️ Arquitectura

```
┌─────────────┐
│  Frontend   │ → React + Vite (Puerto 3000)
│  (Nginx)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │ → Node.js + Express (Puerto 4000)
│  (API REST) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │ → Base de Datos (Puerto 5432)
│   Database  │
└─────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado
- Node.js 20+ (para desarrollo local)
- Git

### Opción 1: Docker Compose (Recomendado)

```bash
# Clonar el repositorio
cd proyecto-infra

# Construir y levantar todos los servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api/pokemon
# PostgreSQL: localhost:5432
```

### Opción 2: Desarrollo Local

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Asegúrate de tener PostgreSQL corriendo
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 API REST Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pokemon` | Listar todos los Pokémon |
| GET | `/api/pokemon/:id` | Obtener un Pokémon |
| GET | `/api/pokemon/tipo/:tipo` | Filtrar por tipo |
| GET | `/api/pokemon/legendarios` | Solo legendarios |
| POST | `/api/pokemon` | Crear nuevo Pokémon |
| PUT | `/api/pokemon/:id` | Actualizar Pokémon |
| DELETE | `/api/pokemon/:id` | Eliminar Pokémon |

## 🎯 Funcionalidades

### Frontend
- ✅ Catálogo visual de Pokémon con tarjetas
- ✅ Filtros por tipo y legendario
- ✅ Búsqueda en tiempo real
- ✅ Formulario para crear/editar Pokémon
- ✅ Visualización de estadísticas (HP, ATK, DEF, SPD)
- ✅ Diseño responsive y profesional
- ✅ Animaciones fluidas

### Backend
- ✅ API REST completa con Express
- ✅ Validación de datos
- ✅ Manejo de errores robusto
- ✅ CORS configurado
- ✅ Logging con Morgan
- ✅ Health checks

### Base de Datos
- ✅ PostgreSQL 16
- ✅ Esquema normalizado
- ✅ Datos seed con 30 Pokémon top
- ✅ Índices optimizados

## 🐳 Docker

### Construir imágenes individuales

```bash
# Backend
docker build -t pokemon-backend ./backend

# Frontend
docker build -t pokemon-frontend ./frontend
```

### Comandos útiles

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡datos se perderán!)
docker-compose down -v

# Reconstruir un servicio específico
docker-compose up --build backend

# Ver estado de contenedores
docker-compose ps

# Acceder a shell de PostgreSQL
docker-compose exec db psql -U postgres -d pokemon_db
```

## ☸️ Kubernetes

Ver documentación detallada en `/kubernetes/README.md`

```bash
# Aplicar todos los manifiestos
kubectl apply -f kubernetes/

# Ver estado
kubectl get all -n pokemon-app

# Escalar backend
kubectl scale deployment backend --replicas=3 -n pokemon-app

# Port forward para acceso local
kubectl port-forward service/frontend 3000:80 -n pokemon-app
```

## ☁️ Azure Cloud

Ver documentación detallada en `/azure/README.md`

### Recursos necesarios:
- Azure Kubernetes Service (AKS)
- Azure Database for PostgreSQL
- Azure Container Registry (ACR)
- Azure Load Balancer

## 🗂️ Estructura del Proyecto

```
proyecto-infra/
├── backend/              # API REST Node.js
│   ├── src/
│   │   ├── config/      # Configuración DB
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── models/      # Modelos de datos
│   │   ├── routes/      # Definición de rutas
│   │   └── server.js    # Punto de entrada
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── services/    # Cliente API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── database/             # Scripts SQL
│   ├── init.sql         # Esquema DB
│   └── seed.sql         # Datos iniciales
├── kubernetes/           # Manifiestos K8s
├── azure/               # Scripts Azure
├── docs/                # Documentación
├── docker-compose.yml   # Orquestación local
└── README.md
```

## 🧪 Testing

### Probar API con curl

```bash
# Listar Pokémon
curl http://localhost:4000/api/pokemon

# Obtener un Pokémon
curl http://localhost:4000/api/pokemon/1

# Crear Pokémon
curl -X POST http://localhost:4000/api/pokemon \
  -H "Content-Type: application/json" \
  -d '{
    "numero_pokedex": 999,
    "nombre": "Test Pokemon",
    "tipo_primario": "Fuego",
    "descripcion": "Pokemon de prueba",
    "stats_hp": 100,
    "stats_ataque": 100,
    "stats_defensa": 100,
    "stats_velocidad": 100,
    "generacion": 1
  }'
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- Axios
- CSS3 (Animaciones y Grid)

### Backend
- Node.js 20
- Express.js
- PostgreSQL (pg driver)
- CORS
- Morgan (logging)

### DevOps
- Docker & Docker Compose
- Kubernetes
- Azure (AKS, ACR, PostgreSQL)
- Nginx (servidor web)

## 📈 Próximos Pasos

1. ✅ Configurar CI/CD con GitHub Actions
2. ✅ Implementar autenticación JWT
3. ✅ Agregar tests unitarios y de integración
4. ✅ Implementar caché con Redis
5. ✅ Monitoreo con Prometheus/Grafana

## 📝 Documentación Adicional

- [Plan del Proyecto](./PLAN_PROYECTO.md) - Plan detallado de desarrollo
- [Proyecto Original](./docs/proyecto.md) - Requisitos académicos
- [Kubernetes Setup](./kubernetes/README.md) - Guía de K8s
- [Azure Deployment](./azure/README.md) - Despliegue en Azure

## 👥 Autor

Proyecto académico - Curso de Infraestructuras con Docker, Kubernetes y Cloud

## 📄 Licencia

Este proyecto es de uso académico.

---

**¡Disfruta capturando y explorando Pokémon!** 🎮⚡🔥
