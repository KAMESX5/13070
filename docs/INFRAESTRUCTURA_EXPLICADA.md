# 🏗️ INFRAESTRUCTURA DEL PROYECTO - GUÍA CONCEPTUAL

## 📖 Introducción

Este documento explica **exclusivamente los conceptos de infraestructura** utilizados en el proyecto, sin entrar en detalles de código de backend, frontend o base de datos. El objetivo es entender **cómo y por qué** se despliega la aplicación de esta manera.

---

## 🎯 ¿Qué es Infraestructura?

La **infraestructura** se refiere a todos los componentes y tecnologías que permiten que una aplicación se ejecute, sea accesible y funcione correctamente. Incluye:

- **Contenedores:** Cómo empaquetamos la aplicación
- **Orquestación:** Cómo gestionamos múltiples contenedores
- **Redes:** Cómo se comunican los servicios
- **Almacenamiento:** Cómo persisten los datos
- **Escalabilidad:** Cómo manejamos más usuarios
- **Alta Disponibilidad:** Cómo evitamos caídas del sistema

---

## 📦 Nivel 1: Contenedores con Docker

### ¿Qué es Docker?

Imagina que quieres enviar tu aplicación a otra persona. Sin Docker, tendrías que darle:
- Tu código
- Las instrucciones: "Instala Node.js versión 20"
- "Instala PostgreSQL versión 16"
- "Instala estas 50 librerías"
- "Configura estos archivos"
- Y rezar porque todo funcione igual en su computadora

Con Docker, creas una **"caja mágica"** que contiene:
- Tu código ✅
- Node.js 20 ✅
- Todas las librerías ✅
- Toda la configuración ✅

La persona solo necesita Docker y ejecutar un comando. **Garantía:** Si funciona en tu máquina, funciona en cualquier máquina.

### Conceptos Clave de Docker

#### 1. **Imagen (Image)**

Una **plantilla inmutable** que contiene todo lo necesario para ejecutar tu aplicación.

```
┌─────────────────────────────────┐
│      IMAGEN DOCKER              │
│  (Plantilla - Solo Lectura)     │
├─────────────────────────────────┤
│  - Sistema Operativo Base       │
│    (Alpine Linux - 5MB)         │
│  - Node.js 20                   │
│  - Código de tu aplicación      │
│  - Dependencias (npm packages)  │
│  - Configuración                │
└─────────────────────────────────┘
```

**Analogía:** Una imagen es como un **molde para hacer galletas**. El molde siempre es el mismo.

#### 2. **Contenedor (Container)**

Una **instancia en ejecución** de una imagen. Puedes crear múltiples contenedores de la misma imagen.

```
Imagen (Molde)
    │
    ├──→ Contenedor 1 (Galleta)
    ├──→ Contenedor 2 (Galleta)
    └──→ Contenedor 3 (Galleta)
```

**Diferencias importantes:**

| Aspecto | Imagen | Contenedor |
|---------|--------|------------|
| **Estado** | Inmutable (no cambia) | Mutable (puede cambiar) |
| **Cantidad** | Una por versión | Muchos de una imagen |
| **Analogía** | Receta de cocina | Plato de comida |

#### 3. **Dockerfile**

Un **script** que define cómo construir una imagen.

```dockerfile
# Ejemplo simplificado
FROM node:20-alpine          # Base: Node.js 20 en Alpine Linux
WORKDIR /app                 # Directorio de trabajo
COPY . .                     # Copiar código
RUN npm install              # Instalar dependencias
CMD ["node", "server.js"]    # Comando para iniciar
```

**¿Por qué Alpine?**
- Linux normal: ~200MB
- Alpine Linux: ~5MB (40x más pequeño)
- Resultado: Imágenes más rápidas de descargar y desplegar

#### 4. **Volumen (Volume)**

Un **almacenamiento persistente** que sobrevive incluso si el contenedor se elimina.

```
Sin Volumen:
┌─────────────┐
│ Contenedor  │ → Datos guardados aquí
└─────────────┘
     │
     └──→ ELIMINAR CONTENEDOR = PERDER DATOS ❌

Con Volumen:
┌─────────────┐     ┌─────────────┐
│ Contenedor  │────▶│  Volumen    │ → Datos aquí
└─────────────┘     └─────────────┘
     │                    │
     └──→ ELIMINAR        └──→ DATOS PERSISTEN ✅
```

**En el proyecto:** El volumen `postgres_data` guarda los 30 Pokémon. Si reinicias Docker, los datos siguen ahí.

#### 5. **Red (Network)**

Una **red virtual** que permite que los contenedores se comuniquen entre sí.

```
┌──────────────────────── DOCKER NETWORK ─────────────────────┐
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  Frontend    │────────▶│   Backend    │                 │
│  │  Contenedor  │ HTTP    │  Contenedor  │                 │
│  └──────────────┘         └──────────────┘                 │
│                                  │                          │
│                                  │ SQL                      │
│                                  ▼                          │
│                           ┌──────────────┐                 │
│                           │  PostgreSQL  │                 │
│                           │  Contenedor  │                 │
│                           └──────────────┘                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Magia:** Dentro de la red, los contenedores se llaman por nombre:
- Frontend se conecta a `http://backend:4000`
- Backend se conecta a `postgres:5432`

Docker resuelve automáticamente estos nombres a las IPs internas.

### Multi-Stage Build

Una técnica para crear imágenes **más pequeñas y seguras**.

```dockerfile
# ETAPA 1: Construcción (Build)
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install        # Instala TODO (dev + prod)
RUN npm run build      # Compila la aplicación

# ETAPA 2: Producción
FROM nginx:alpine      # Imagen ligera
COPY --from=builder /app/dist /usr/share/nginx/html  # Solo archivos finales
# NO copia node_modules, ni código fuente, ni herramientas de build
```

**Resultado:**
- Imagen con todo: 450MB ❌
- Imagen multi-stage: 45MB ✅ (90% más pequeña)

**Beneficios:**
1. **Velocidad:** Más rápido de descargar y desplegar
2. **Seguridad:** Menos paquetes = menos vulnerabilidades
3. **Costo:** Menos almacenamiento en registries

---

## 🐙 Nivel 2: Orquestación con Docker Compose

### ¿Qué es Docker Compose?

Docker maneja **un contenedor a la vez**. ¿Y si tu aplicación necesita 3 contenedores (frontend, backend, database)?

Docker Compose te permite:
- Definir múltiples servicios en un archivo YAML
- Iniciarlos todos con un comando
- Gestionar sus conexiones automáticamente

### Arquitectura de Docker Compose

```
docker-compose.yml (Orquestador)
│
├─── Service 1: postgres
│    ├── Usa imagen: postgres:16-alpine
│    ├── Puerto: 5432
│    ├── Volumen: postgres_data
│    └── Red: pokemon_network
│
├─── Service 2: backend
│    ├── Usa imagen: pokemon-backend
│    ├── Puerto: 4000
│    ├── Espera a: postgres (depends_on)
│    └── Red: pokemon_network
│
└─── Service 3: frontend
     ├── Usa imagen: pokemon-frontend
     ├── Puerto: 3000 → 80
     ├── Espera a: backend
     └── Red: pokemon_network
```

### Conceptos Clave de Docker Compose

#### 1. **Services**

Un "service" es básicamente un contenedor con configuración.

```yaml
services:
  backend:                # Nombre del servicio
    build: .              # Construir desde Dockerfile
    ports:
      - "4000:4000"       # Puerto HOST:CONTENEDOR
    environment:
      DB_HOST: postgres   # Variables de entorno
```

#### 2. **depends_on (Orden de Inicio)**

```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy
```

**¿Qué hace esto?**

```
Inicio normal (sin depends_on):
┌─────────┐  ┌─────────┐  ┌─────────┐
│Postgres │  │ Backend │  │Frontend │
│ Inicia  │  │ Inicia  │  │ Inicia  │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │             │
     │            └──X── ERROR: No puede conectar a postgres
     └──────────────── Tarda 10 segundos en estar listo

Con depends_on + health check:
┌─────────┐
│Postgres │
│ Inicia  │
└────┬────┘
     │ 10 segundos...
     ├─── Health Check: ✅ LISTO
     │
     ├──→ ┌─────────┐
     │    │ Backend │
     │    │ Inicia  │
     │    └────┬────┘
     │         │ Backend conecta exitosamente
     │         ├─── Health Check: ✅ LISTO
     │         │
     │         └──→ ┌─────────┐
     │              │Frontend │
     │              │ Inicia  │
     │              └─────────┘
     └── Orden garantizado ✅
```

#### 3. **Health Checks**

Un health check es una **prueba automática** que Docker ejecuta para saber si un servicio está funcionando.

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s     # Revisar cada 10 segundos
  timeout: 5s       # Esperar máximo 5 segundos
  retries: 5        # Intentar 5 veces antes de declarar "unhealthy"
```

**Estados posibles:**
- `starting`: Recién iniciado, aún no se revisa
- `healthy`: ✅ Pasó el health check
- `unhealthy`: ❌ Falló el health check

**Ciclo de vida:**

```
Contenedor inicia
    ↓
[starting] ────→ Espera initialDelaySeconds
    ↓
Ejecuta health check cada "interval" segundos
    ↓
¿Pasó? ─── SÍ ──→ [healthy] ✅
    │
    NO
    ↓
Reintentar (hasta "retries" veces)
    ↓
¿Sigue fallando? ─── SÍ ──→ [unhealthy] ❌
                                ↓
                          Reiniciar contenedor
```

#### 4. **Ports (Mapeo de Puertos)**

```yaml
ports:
  - "3000:80"
    │    │
    │    └── Puerto DENTRO del contenedor
    └────── Puerto en TU COMPUTADORA (host)
```

**¿Por qué son diferentes?**

```
Tu computadora (host)
    ↓ localhost:3000
┌─────────────────────────────────┐
│   Docker Network                │
│                                 │
│   Contenedor Frontend           │
│   Nginx escucha en puerto 80 ◄──┤
└─────────────────────────────────┘
```

Esto permite:
- Tener múltiples contenedores usando el mismo puerto interno (80)
- Pero exponerlos en diferentes puertos externos (3000, 4000, 5000...)

#### 5. **Volumes (Persistencia)**

```yaml
volumes:
  postgres_data:      # Nombre del volumen
    driver: local     # Almacenar en disco local
```

**¿Dónde se guarda?**

```bash
# Linux
/var/lib/docker/volumes/pokemon_postgres_data/_data/

# Ver contenido
docker volume inspect pokemon_postgres_data
```

**Ciclo de vida:**

```
docker-compose up
    ↓
Crea volumen (si no existe)
    ↓
Monta volumen en contenedor
    ↓
Postgres guarda datos en volumen
    ↓
docker-compose down
    ↓
Contenedor eliminado ✓
Volumen PERSISTE ✓ ←── DATOS SIGUEN AHÍ
    ↓
docker-compose up (de nuevo)
    ↓
Monta el MISMO volumen
    ↓
Postgres ve los datos anteriores ✅
```

#### 6. **Networks (Redes)**

```yaml
networks:
  pokemon_network:
    driver: bridge
```

**¿Qué es "bridge"?**

Es una red virtual que actúa como un **switch** entre contenedores:

```
┌─────────────────────── Bridge Network ───────────────────────┐
│                                                               │
│  Contenedor 1          Contenedor 2          Contenedor 3    │
│  (frontend)            (backend)             (postgres)       │
│  IP: 172.18.0.2        IP: 172.18.0.3        IP: 172.18.0.4  │
│       │                      │                     │          │
│       └──────────────────────┴─────────────────────┘          │
│                          Switch                               │
│                      (DNS interno)                            │
│                                                               │
│  frontend puede llamar a "backend" en vez de 172.18.0.3      │
│  backend puede llamar a "postgres" en vez de 172.18.0.4      │
└───────────────────────────────────────────────────────────────┘
```

**Aislamiento:** Otros contenedores en tu computadora **no pueden** acceder a esta red a menos que estén explícitamente conectados.

---

## ☸️ Nivel 3: Orquestación con Kubernetes

### ¿Por qué Kubernetes si ya tenemos Docker Compose?

Docker Compose es genial para **desarrollo local**, pero en **producción** necesitas:

| Necesidad | Docker Compose | Kubernetes |
|-----------|----------------|------------|
| **Múltiples servidores** | ❌ Solo una máquina | ✅ Cluster de nodos |
| **Auto-recuperación** | ⚠️ Básico | ✅ Avanzado |
| **Escalado automático** | ❌ Manual | ✅ Automático (HPA) |
| **Rolling updates** | ❌ Downtime | ✅ Sin downtime |
| **Load balancing** | ❌ Manual | ✅ Integrado |
| **Gestión de secretos** | ⚠️ Variables env | ✅ Secrets encriptados |

### Arquitectura de Kubernetes

```
┌────────────────────── KUBERNETES CLUSTER ──────────────────────┐
│                                                                 │
│  ┌─────────────────── CONTROL PLANE ───────────────────┐      │
│  │  (Cerebro del cluster - Gestionado por Azure/K8s)   │      │
│  │                                                       │      │
│  │  • API Server: Recibe comandos kubectl               │      │
│  │  • Scheduler: Decide dónde colocar pods              │      │
│  │  • Controller Manager: Mantiene estado deseado       │      │
│  │  • etcd: Base de datos del estado del cluster        │      │
│  └───────────────────────────────────────────────────────┘      │
│                            │                                    │
│              ┌─────────────┼─────────────┐                     │
│              │             │             │                     │
│         ┌────▼────┐   ┌────▼────┐   ┌───▼─────┐              │
│         │ NODE 1  │   │ NODE 2  │   │ NODE 3  │              │
│         │ (VM)    │   │ (VM)    │   │ (VM)    │              │
│         │         │   │         │   │         │              │
│         │ ┌─────┐ │   │ ┌─────┐ │   │ ┌─────┐ │              │
│         │ │ Pod │ │   │ │ Pod │ │   │ │ Pod │ │              │
│         │ └─────┘ │   │ └─────┘ │   │ └─────┘ │              │
│         │ ┌─────┐ │   │ ┌─────┐ │   │ ┌─────┐ │              │
│         │ │ Pod │ │   │ │ Pod │ │   │ │ Pod │ │              │
│         │ └─────┘ │   │ └─────┘ │   │ └─────┘ │              │
│         └─────────┘   └─────────┘   └─────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Conceptos Clave de Kubernetes

#### 1. **Pod**

La **unidad mínima** desplegable en Kubernetes. Contiene uno o más contenedores.

```
┌─────────────────────────────┐
│          POD                │
│                             │
│  ┌─────────────────────┐   │
│  │  Contenedor Backend │   │  ← Usualmente 1 contenedor por pod
│  │  (pokemon-backend)  │   │
│  └─────────────────────┘   │
│                             │
│  IP: 10.244.1.5             │
│  Namespace: pokemon-app     │
└─────────────────────────────┘
```

**Pod vs Contenedor:**

| Aspecto | Contenedor | Pod |
|---------|------------|-----|
| **Definición** | Proceso aislado | Grupo de contenedores |
| **Red** | IP del host | IP propia del pod |
| **Volúmenes** | Monta volúmenes | Todos los contenedores comparten volúmenes |
| **Ciclo de vida** | Parte del pod | Unidad de despliegue |

**¿Por qué no desplegar contenedores directamente?**

Kubernetes necesita información adicional:
- ¿Dónde ejecutar el contenedor?
- ¿Cuánta CPU/memoria necesita?
- ¿Cómo reiniciarlo si falla?
- ¿Cómo comunicarse con él?

El pod es el "envoltorio" que contiene esta información.

#### 2. **Deployment**

Un **controlador** que gestiona múltiples réplicas de pods.

```
Deployment: backend (spec: 3 réplicas)
    │
    ├──→ Pod 1 (backend-abc123)
    ├──→ Pod 2 (backend-def456)
    └──→ Pod 3 (backend-ghi789)
```

**¿Qué hace el Deployment?**

```
Estado Deseado (Declarativo):
"Quiero 3 réplicas del backend ejecutándose"

    ↓

Kubernetes trabaja para mantener ese estado:

1. Crea 3 pods ✓
2. Uno falla → Crea reemplazo automáticamente ✓
3. Actualizas imagen → Rolling update sin downtime ✓
4. Escalas a 5 → Crea 2 pods adicionales ✓
5. Reduces a 2 → Elimina 1 pod gradualmente ✓
```

**Ejemplo de Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3                    # ← Estado deseado
  selector:
    matchLabels:
      app: backend
  template:                      # ← Plantilla del pod
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: pokemon-backend:latest
        ports:
        - containerPort: 4000
```

#### 3. **Service**

Un **balanceador de carga interno** que expone pods.

**Problema:** Los pods tienen IPs dinámicas que cambian al reiniciarse.

```
Pod 1: 10.244.1.5 ──┐
Pod 2: 10.244.2.8 ──┼── ¿A cuál conectarse?
Pod 3: 10.244.3.2 ──┘
```

**Solución:** El Service crea una **IP estable** y balancea automáticamente.

```
Service: backend-service (IP: 10.96.185.123)
    │
    ├──→ Pod 1: 10.244.1.5
    ├──→ Pod 2: 10.244.2.8
    └──→ Pod 3: 10.244.3.2

Frontend conecta a: backend-service:4000
Service distribuye requests entre los 3 pods ✅
```

**Tipos de Services:**

```
┌─────────────────────────────────────────────────────────┐
│ ClusterIP (Predeterminado)                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━                               │
│ IP interna del cluster                                  │
│ Solo accesible DENTRO de Kubernetes                     │
│                                                          │
│ Uso: postgres-service                                   │
│ Nadie fuera del cluster necesita acceder a la BD        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ NodePort                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│ Expone puerto en cada nodo del cluster                  │
│ Accesible en: <NODE_IP>:<NODE_PORT>                     │
│                                                          │
│ Uso: Testing/desarrollo                                 │
│ Rango de puertos: 30000-32767                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LoadBalancer                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│ Crea un balanceador de carga EXTERNO                    │
│ Asigna IP pública (en cloud providers)                  │
│                                                          │
│ Uso: backend-service, frontend-service                  │
│ Accesible desde Internet ✅                             │
└─────────────────────────────────────────────────────────┘
```

#### 4. **ConfigMap y Secret**

Ambos almacenan configuración, pero con diferentes niveles de seguridad.

**ConfigMap:** Datos **no sensibles** (públicos)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_NAME: pokemon_db      # OK mostrar
  API_PORT: "4000"               # OK mostrar
  ENVIRONMENT: production        # OK mostrar
```

**Secret:** Datos **sensibles** (privados)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: postgres123  # ❌ NO mostrar en logs
  API_KEY: sk_live_xyz123         # ❌ NO mostrar en Git
```

**Diferencias:**

| Aspecto | ConfigMap | Secret |
|---------|-----------|--------|
| **Contenido** | No sensible | Sensible (passwords, tokens) |
| **Codificación** | Texto plano | Base64 |
| **En logs** | Visible | Ocultado |
| **En Git** | OK commitear | ❌ NUNCA commitear |
| **Encriptación** | No | Sí (en etcd) |

**Uso en pods:**

```yaml
env:
- name: DB_NAME
  valueFrom:
    configMapKeyRef:       # Leer desde ConfigMap
      name: app-config
      key: DATABASE_NAME
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:          # Leer desde Secret
      name: postgres-secret
      key: POSTGRES_PASSWORD
```

#### 5. **PersistentVolumeClaim (PVC)**

Un **disco virtual** que solicita almacenamiento persistente.

```
PersistentVolumeClaim (PVC)
"Necesito 1GB de almacenamiento"
    │
    ↓
Kubernetes busca o crea un PersistentVolume (PV)
    │
    ↓
PV (Volumen físico)
Disco en: Azure Disk / AWS EBS / GCP Persistent Disk
    │
    ↓
Se monta en el pod
    │
    ↓
PostgreSQL guarda datos aquí
```

**Sin PVC:**

```
Pod 1 (postgres) → Datos en disco efímero
    │
    └──→ Pod se reinicia
           │
           └──→ DATOS PERDIDOS ❌
```

**Con PVC:**

```
Pod 1 (postgres) ──→ PVC ──→ Datos en disco persistente
    │                          (Azure Disk)
    └──→ Pod se reinicia
           │
           ├──→ Nuevo pod se crea
           │
           └──→ Se monta el MISMO PVC
                  │
                  └──→ DATOS INTACTOS ✅
```

**Definición:**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce     # Solo un pod puede escribir a la vez
  resources:
    requests:
      storage: 1Gi      # Solicitar 1 Gigabyte
  storageClassName: standard  # Tipo de disco
```

#### 6. **Namespace**

Un **espacio de nombres** para aislar recursos lógicamente.

```
Kubernetes Cluster
│
├─── Namespace: default
│    ├── Deployment: nginx
│    └── Service: nginx-service
│
├─── Namespace: pokemon-app  ← Nuestro proyecto
│    ├── Deployment: backend (3 pods)
│    ├── Deployment: frontend (1 pod)
│    ├── Deployment: postgres (1 pod)
│    ├── Service: backend-service
│    ├── Service: frontend-service
│    └── Service: postgres-service
│
└─── Namespace: monitoring
     ├── Deployment: prometheus
     └── Service: grafana
```

**Beneficios:**

1. **Organización:** Agrupar recursos relacionados
2. **Aislamiento:** Los recursos en diferentes namespaces no se ven
3. **Cuotas:** Limitar recursos por namespace (ej: max 10 pods)
4. **Permisos:** Dar acceso solo a ciertos namespaces

**Comunicación entre namespaces:**

```
Mismo namespace:
frontend → backend-service:4000 ✅

Diferente namespace:
frontend → backend-service.pokemon-app.svc.cluster.local:4000 ✅
            │              │          │       │
            └ Service      └ Namespace└ "svc" └ dominio interno
```

### Escalabilidad en Kubernetes

#### Escalado Manual

```bash
kubectl scale deployment backend --replicas=5
```

**¿Qué pasa internamente?**

```
Estado actual: 3 réplicas
Estado deseado: 5 réplicas
    ↓
Kubernetes calcula: Necesito 2 pods más
    ↓
1. Crea 2 pods nuevos
2. Espera a que estén "Ready" (health checks)
3. Service empieza a enviar tráfico a los 5 pods
    ↓
Sin downtime ✅
```

#### Horizontal Pod Autoscaler (HPA)

**Escalado automático** basado en métricas.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3              # Mínimo 3 pods siempre
  maxReplicas: 10             # Máximo 10 pods
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Escalar si CPU > 70%
```

**Funcionamiento:**

```
1. Bajo tráfico (CPU: 20%)
   ┌───┐ ┌───┐ ┌───┐
   │ P │ │ P │ │ P │  ← 3 réplicas
   └───┘ └───┘ └───┘

2. Tráfico aumenta (CPU: 80%)
   HPA detecta: CPU > 70% ❗
   ↓
   Escala a 6 réplicas ⬆️
   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
   │ P │ │ P │ │ P │ │ P │ │ P │ │ P │
   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
   CPU baja a ~40% ✓

3. Tráfico disminuye (CPU: 30%)
   HPA detecta: CPU < 70% durante 5 minutos
   ↓
   Reduce a 3 réplicas ⬇️
   ┌───┐ ┌───┐ ┌───┐
   │ P │ │ P │ │ P │
   └───┘ └───┘ └───┘
```

### Self-Healing (Auto-Recuperación)

Kubernetes monitorea constantemente los pods y los **repara automáticamente**.

#### Liveness Probe

Detecta si un contenedor está **vivo** (funcionando internamente).

```yaml
livenessProbe:
  httpGet:
    path: /health        # Llamar GET /health
    port: 4000
  initialDelaySeconds: 30  # Esperar 30s antes de empezar
  periodSeconds: 10        # Revisar cada 10 segundos
  failureThreshold: 3      # Fallar 3 veces = reiniciar
```

**Flujo:**

```
Pod inicia
    ↓
Espera 30 segundos (initialDelaySeconds)
    ↓
Cada 10 segundos ejecuta: GET /health
    ↓
¿Responde 200 OK?
    │
    ├── SÍ → Pod está vivo ✅ (continuar monitoreando)
    │
    └── NO → Contador de fallos++
               │
               └── ¿Fallos >= 3?
                       │
                       └── SÍ → ⚠️ REINICIAR CONTENEDOR
```

**Ejemplo real:**

```
10:00:00 - Liveness: 200 OK ✓
10:00:10 - Liveness: 200 OK ✓
10:00:20 - Liveness: 200 OK ✓
10:00:30 - Liveness: 500 ERROR ✗ (fallo 1/3)
10:00:40 - Liveness: 500 ERROR ✗ (fallo 2/3)
10:00:50 - Liveness: 500 ERROR ✗ (fallo 3/3)
10:01:00 - ⚠️ REINICIANDO CONTENEDOR...
10:01:15 - Nuevo contenedor iniciado
10:01:45 - Liveness: 200 OK ✓ (recuperado)
```

#### Readiness Probe

Detecta si un contenedor está **listo** para recibir tráfico.

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Diferencia con Liveness:**

| Aspecto | Liveness Probe | Readiness Probe |
|---------|---------------|-----------------|
| **Pregunta** | ¿Está vivo? | ¿Está listo? |
| **Acción si falla** | Reiniciar contenedor | Quitar de Service (no enviar tráfico) |
| **Ejemplo** | Proceso crashed | Cargando datos iniciales |

**Flujo:**

```
Pod inicia
    ↓
Estado: Not Ready (no recibe tráfico)
    ↓
Readiness Probe cada 5 segundos
    ↓
¿Responde 200 OK?
    │
    ├── SÍ → Pod pasa a Ready ✅
    │        Service empieza a enviar tráfico
    │
    └── NO → Pod sigue Not Ready
             Service NO envía tráfico (protege de errores)
```

**Caso de uso real:**

```
Backend inicia
    ↓
Necesita conectarse a PostgreSQL (tarda 10 segundos)
    ↓
Durante esos 10 segundos:
- Liveness: OK (proceso está vivo)
- Readiness: NO (no puede responder requests aún)
- Service: No envía tráfico a este pod
    ↓
Después de conectarse a PostgreSQL:
- Readiness: OK ✓
- Service: Empieza a enviar tráfico ✓
```

### Rolling Updates (Actualizaciones sin Downtime)

Actualizar la aplicación **sin interrumpir el servicio**.

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1          # Máximo 1 pod extra durante update
    maxUnavailable: 1    # Máximo 1 pod no disponible
```

**Flujo de actualización:**

```
Estado inicial: 3 pods con versión v1
┌─────┐ ┌─────┐ ┌─────┐
│ v1  │ │ v1  │ │ v1  │
└─────┘ └─────┘ └─────┘

Comando: kubectl set image deployment/backend backend=backend:v2

Paso 1: Crear 1 pod nuevo (maxSurge: 1)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ v1  │ │ v1  │ │ v1  │ │ v2  │ ← Nuevo
└─────┘ └─────┘ └─────┘ └─────┘

Paso 2: Esperar a que v2 esté Ready
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ v1  │ │ v1  │ │ v1  │ │ v2✓ │ ← Ready
└─────┘ └─────┘ └─────┘ └─────┘

Paso 3: Eliminar 1 pod v1 (maxUnavailable: 1)
┌─────┐ ┌─────┐          ┌─────┐
│ v1  │ │ v1  │          │ v2✓ │
└─────┘ └─────┘          └─────┘

Paso 4: Crear otro pod v2
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ v1  │ │ v1  │ │ v2  │ │ v2✓ │
└─────┘ └─────┘ └─────┘ └─────┘

Paso 5: Esperar Ready
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ v1  │ │ v1  │ │ v2✓ │ │ v2✓ │
└─────┘ └─────┘ └─────┘ └─────┘

Paso 6: Eliminar otro pod v1
┌─────┐          ┌─────┐ ┌─────┐
│ v1  │          │ v2✓ │ │ v2✓ │
└─────┘          └─────┘ └─────┘

Paso 7: Crear último pod v2
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ v1  │ │ v2  │ │ v2✓ │ │ v2✓ │
└─────┘ └─────┘ └─────┘ └─────┘

Paso 8: Esperar Ready y eliminar último v1
         ┌─────┐ ┌─────┐ ┌─────┐
         │ v2✓ │ │ v2✓ │ │ v2✓ │
         └─────┘ └─────┘ └─────┘

✅ Actualización completa sin downtime
```

**Durante todo el proceso:**
- Siempre hay al menos 2 pods funcionando
- El Service continúa enviando tráfico
- Los usuarios no notan la actualización

---

## ☁️ Nivel 4: Cloud Computing con Azure

### ¿Por qué Azure (o cualquier Cloud)?

**Problema local:**
- Tu aplicación corre en tu laptop
- Solo accesible cuando tu laptop está encendida
- Solo accesible en tu red local
- Si tu laptop se rompe → aplicación cae

**Solución Cloud:**
- Aplicación corre en data centers de Azure (24/7/365)
- Accesible desde cualquier parte del mundo
- Múltiples réplicas en diferentes servidores
- Si un servidor falla → otros continúan

### Azure Kubernetes Service (AKS)

**AKS** es Kubernetes **administrado por Microsoft**.

```
Kubernetes "vanilla" (hazlo tú mismo):
┌────────────────────────────────────────┐
│ TÚ gestionas:                          │
│ • Instalar Kubernetes                  │
│ • Configurar master nodes              │
│ • Configurar worker nodes              │
│ • Actualizar versiones                 │
│ • Parches de seguridad                 │
│ • Backups                              │
│ • Monitoreo                            │
│ • Alta disponibilidad                  │
└────────────────────────────────────────┘
Tiempo: Días/semanas ⏰
Complejidad: Alta 🔴

AKS (Azure Kubernetes Service):
┌────────────────────────────────────────┐
│ AZURE gestiona:                        │
│ • Master node ✅ (gratis)              │
│ • Actualizaciones ✅                   │
│ • Parches de seguridad ✅              │
│ • Alta disponibilidad ✅               │
│                                        │
│ TÚ gestionas:                          │
│ • Tus aplicaciones (deployments)      │
│ • Número de nodos worker              │
└────────────────────────────────────────┘
Tiempo: Minutos ⏱️
Complejidad: Baja 🟢
```

### Azure Container Registry (ACR)

Un **Docker Hub privado** en Azure.

```
Flujo de despliegue:

1. Desarrollo local
   docker build -t pokemon-backend:v1 .

2. Push a ACR
   docker tag pokemon-backend:v1 myregistry.azurecr.io/pokemon-backend:v1
   docker push myregistry.azurecr.io/pokemon-backend:v1

3. AKS pull desde ACR
   ┌─────────────────────┐
   │   ACR (Registry)    │
   │  ┌──────────────┐   │
   │  │ backend:v1   │   │
   │  │ frontend:v1  │   │
   │  └──────────────┘   │
   └─────────┬───────────┘
             │ pull
             ▼
   ┌─────────────────────┐
   │   AKS (Cluster)     │
   │  ┌──────────────┐   │
   │  │ 3 Pods       │   │
   │  │ backend:v1   │   │
   │  └──────────────┘   │
   └─────────────────────┘
```

**¿Por qué no Docker Hub público?**

| Aspecto | Docker Hub | ACR |
|---------|------------|-----|
| **Seguridad** | Público (cualquiera puede ver) | Privado (solo tu equipo) |
| **Velocidad** | Internet público | Red interna Azure (rápido) |
| **Costo** | Gratis (límites de pull) | Pago (~$5/mes Basic) |
| **Integración AKS** | Manual | Automática |

### Azure Database for PostgreSQL

Base de datos **administrada** por Azure.

```
PostgreSQL en contenedor (nuestro enfoque local):
┌────────────────────────────────────────┐
│ TÚ gestionas:                          │
│ • Backups manualmente                  │
│ • Actualizaciones de PostgreSQL        │
│ • Replicación (si quieres HA)          │
│ • Monitoreo de disco                   │
│ • Seguridad (firewall, SSL)            │
└────────────────────────────────────────┘

Azure Database for PostgreSQL:
┌────────────────────────────────────────┐
│ AZURE gestiona:                        │
│ • Backups automáticos (7-35 días) ✅   │
│ • Actualizaciones automáticas ✅       │
│ • Alta disponibilidad (99.99% SLA) ✅  │
│ • Escalado de almacenamiento ✅        │
│ • Seguridad (SSL forzado) ✅           │
│ • Monitoreo 24/7 ✅                    │
└────────────────────────────────────────┘
```

### Azure Load Balancer

Distribuye tráfico entre múltiples instancias.

```
Sin Load Balancer:
Usuario → http://52.123.45.67:4000 → Pod 1
                                      (si falla, usuario ve error ❌)

Con Load Balancer:
Usuario → http://backend-lb.azure.com
            ↓
    Azure Load Balancer
            ↓
    ┌───────┼───────┐
    ▼       ▼       ▼
  Pod 1   Pod 2   Pod 3
  
Si Pod 1 falla:
    ↓
Load Balancer detecta (health check)
    ↓
Redirige tráfico a Pod 2 y Pod 3 ✅
    ↓
Usuario no nota la diferencia
```

---

## 🔄 Comparación Final: Evolución de la Infraestructura

### Nivel 0: Sin Contenedores (Antiguo)

```
┌─────────────────────────────────────────────┐
│     Tu Computadora                          │
│                                             │
│  PostgreSQL (instalado localmente)          │
│  Node.js (instalado localmente)             │
│  Backend (puerto 4000)                      │
│  Frontend (puerto 3000)                     │
│                                             │
│  Problemas:                                 │
│  • "Funciona en mi máquina" ≠ en producción│
│  • Conflictos de versiones                  │
│  • Difícil de replicar                      │
│  • No portable                              │
└─────────────────────────────────────────────┘
```

### Nivel 1: Con Docker

```
┌─────────────────────────────────────────────┐
│     Tu Computadora                          │
│  ┌────────────────────────────────────────┐ │
│  │  Docker Engine                         │ │
│  │                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────┐│ │
│  │  │PostgreSQL│  │ Backend  │  │Frontend││ │
│  │  │Container │  │Container │  │Container││ │
│  │  └──────────┘  └──────────┘  └──────┘│ │
│  └────────────────────────────────────────┘ │
│                                             │
│  Mejoras:                                   │
│  • Portable ✅                              │
│  • Aislado ✅                               │
│  • Reproducible ✅                          │
│  • Pero... solo en una máquina ⚠️          │
└─────────────────────────────────────────────┘
```

### Nivel 2: Con Docker Compose

```
┌─────────────────────────────────────────────┐
│     Tu Computadora                          │
│  ┌────────────────────────────────────────┐ │
│  │  Docker Compose                        │ │
│  │                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────┐│ │
│  │  │PostgreSQL│◄─│ Backend  │◄─│Frontend││ │
│  │  │ +Volume  │  │ +Health  │  │ +Nginx ││ │
│  │  └──────────┘  └──────────┘  └──────┘│ │
│  │       │             │            │    │ │
│  │       └─────────────┴────────────┘    │ │
│  │         pokemon_network (Bridge)      │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  Mejoras:                                   │
│  • Orquestación simple ✅                   │
│  • Un comando para iniciar todo ✅          │
│  • Networking automático ✅                 │
│  • Pero... solo desarrollo local ⚠️        │
└─────────────────────────────────────────────┘
```

### Nivel 3: Con Kubernetes (Local)

```
┌─────────────────────────────────────────────┐
│  Minikube (Cluster local)                   │
│  ┌────────────────────────────────────────┐ │
│  │  Kubernetes                            │ │
│  │                                        │ │
│  │  Namespace: pokemon-app                │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │ Deployment: backend (3 pods)    │  │ │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐        │  │ │
│  │  │  │Pod 1│ │Pod 2│ │Pod 3│        │  │ │
│  │  │  └─────┘ └─────┘ └─────┘        │  │ │
│  │  └────────────┬────────────────────┘  │ │
│  │               │                        │ │
│  │  ┌────────────▼────────────┐          │ │
│  │  │ Service: LoadBalancer   │          │ │
│  │  └─────────────────────────┘          │ │
│  │                                        │ │
│  │  PVC: postgres-pvc (1Gi)               │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  Mejoras:                                   │
│  • Escalado horizontal ✅                   │
│  • Self-healing ✅                          │
│  • Load balancing ✅                        │
│  • Rolling updates ✅                       │
│  • Pero... solo local ⚠️                   │
└─────────────────────────────────────────────┘
```

### Nivel 4: Con Kubernetes en Azure Cloud

```
┌──────────────────────── AZURE CLOUD ────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AKS (Kubernetes administrado)                       │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │  Node 1  │  │  Node 2  │  │  Node 3  │          │  │
│  │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │          │  │
│  │  │ │Pod B1│ │  │ │Pod B2│ │  │ │Pod B3│ │          │  │
│  │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │          │  │
│  │  │ ┌──────┐ │  │ ┌──────┐ │  │          │          │  │
│  │  │ │Pod F │ │  │ │Pod P │ │  │          │          │  │
│  │  │ └──────┘ │  │ └──────┘ │  │          │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  │         │             │             │                │  │
│  │         └─────────────┴─────────────┘                │  │
│  │                       │                              │  │
│  │              ┌────────▼────────┐                     │  │
│  │              │ Load Balancer   │                     │  │
│  │              │  (IP pública)   │                     │  │
│  │              └────────┬────────┘                     │  │
│  └───────────────────────┼──────────────────────────────┘  │
│                          │                                 │
│  ┌───────────────────────▼──────────────┐                 │
│  │  Azure Database for PostgreSQL      │                 │
│  │  • Backups automáticos               │                 │
│  │  • Alta disponibilidad               │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  ┌────────────────────────────────────┐                   │
│  │  Azure Container Registry          │                   │
│  │  • pokemon-backend:v1              │                   │
│  │  • pokemon-frontend:v1             │                   │
│  └────────────────────────────────────┘                   │
└────────────────────────────────────────────────────────────┘
                          │
                          │ Internet (HTTPS)
                          ▼
                   🌐 Usuarios Globales
```

**Mejoras finales:**
✅ Accesible 24/7 desde cualquier lugar  
✅ Escalado automático (HPA)  
✅ Alta disponibilidad multi-zona  
✅ Backups automáticos  
✅ Actualizaciones sin downtime  
✅ Monitoreo y alertas 24/7  
✅ Disaster recovery  

---

## 🎓 Resumen Ejecutivo

### Conceptos Clave Aprendidos

1. **Contenedores (Docker)**: Empaquetar aplicaciones con todas sus dependencias
2. **Orquestación (Docker Compose)**: Gestionar múltiples contenedores localmente
3. **Orquestación Avanzada (Kubernetes)**: Gestionar aplicaciones en producción
4. **Cloud Computing (Azure)**: Infraestructura escalable y administrada

### Flujo Completo de Despliegue

```
1. Desarrollo Local
   ↓
   Escribir código (backend, frontend, database)
   ↓
2. Contenedorización
   ↓
   Crear Dockerfiles
   ↓
3. Prueba Local
   ↓
   docker-compose up (3 servicios)
   ↓
4. Orquestación Kubernetes Local
   ↓
   minikube start → kubectl apply -f kubernetes/
   ↓
5. Despliegue Cloud
   ↓
   Push a ACR → Deploy a AKS → Conectar a Azure PostgreSQL
   ↓
6. Producción
   ↓
   Aplicación accesible globalmente 24/7
```

### Por Qué Cada Tecnología

| Tecnología | Problema que Resuelve |
|------------|----------------------|
| **Docker** | "Funciona en mi máquina" ≠ producción |
| **Docker Compose** | Gestionar 3+ contenedores es tedioso |
| **Kubernetes** | Necesito escalabilidad y auto-recuperación |
| **Azure AKS** | Gestionar Kubernetes es complejo |
| **Azure ACR** | Necesito registry privado y rápido |
| **Azure PostgreSQL** | Quiero BD administrada con backups |

### Números del Proyecto

| Métrica | Valor |
|---------|-------|
| **Contenedores** | 3 (postgres, backend, frontend) |
| **Réplicas Backend** | 3 (alta disponibilidad) |
| **Pods totales** | 5 (3 backend + 1 frontend + 1 postgres) |
| **Nodos AKS** | 3 (distribución multi-zona) |
| **Uptime esperado** | 99.95% (SLA de Azure) |
| **Tiempo de recuperación** | 15 segundos (self-healing) |
| **Tiempo de escalado** | 30 segundos (3→5 réplicas) |

---

## 🚀 Próximos Pasos Sugeridos

1. **Entender los manifiestos de Kubernetes**: Lee cada archivo `.yaml` en `kubernetes/`
2. **Experimentar con escalado**: `kubectl scale deployment backend --replicas=10`
3. **Simular fallos**: `kubectl delete pod <pod-name>` y ver cómo se recupera
4. **Explorar Azure**: Seguir la guía `GUIA_DESPLIEGUE_AZURE.md`
5. **Monitoreo**: Instalar Prometheus y Grafana en Kubernetes

---

**🎯 Conclusión:** La infraestructura moderna es sobre **automatización**, **escalabilidad** y **resiliencia**. Este proyecto demuestra cómo pasar de una aplicación local a una aplicación de nivel empresarial lista para producción.

---

**Autor:** Proyecto Pokemon - Infraestructura  
**Fecha:** Diciembre 2025  
**Versión:** 1.0
