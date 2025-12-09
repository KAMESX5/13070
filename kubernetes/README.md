# 🎮 Kubernetes - Despliegue de Aplicación Pokémon

Manifiestos de Kubernetes para desplegar la aplicación de Pokémon con arquitectura de microservicios.

## 📋 Arquitectura en Kubernetes

```
┌─────────────────────┐
│  frontend-service   │  (LoadBalancer - Puerto 80)
│   (Acceso externo)  │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  frontend   │  (1 réplica)
    │ Deployment  │
    └─────────────┘

┌─────────────────────┐
│  backend-service    │  (ClusterIP - Puerto 4000)
│  (Load Balancer     │
│   interno K8s)      │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │   backend   │  (3 RÉPLICAS) ✅
    │ Deployment  │
    └──────┬──────┘
           │
┌──────────▼──────────┐
│ postgres-service    │  (ClusterIP - Puerto 5432)
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  postgres   │  (1 réplica)
    │ Deployment  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ postgres-pvc│  (Almacenamiento persistente)
    └─────────────┘
```

## 📦 Componentes

### Namespace
- `namespace.yaml` - Aislamiento lógico (pokemon-app)

### Base de Datos
- `postgres-config.yaml` - ConfigMap y Secret con credenciales
- `postgres-init-configmap.yaml` - Scripts SQL de inicialización
- `postgres-pvc.yaml` - Almacenamiento persistente (1Gi)
- `postgres-deployment.yaml` - PostgreSQL 16
- `postgres-service.yaml` - Servicio interno (ClusterIP)

### Backend API
- `backend-config.yaml` - Configuración y secretos
- `backend-deployment.yaml` - **3 réplicas** de la API
- `backend-service.yaml` - Load Balancer interno

### Frontend
- `frontend-deployment.yaml` - Aplicación React
- `frontend-service.yaml` - Acceso externo (LoadBalancer)

## 🚀 Despliegue

### Prerrequisitos

**Opción 1: Minikube**
```bash
# Instalar minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Iniciar minikube
minikube start --driver=docker

# Verificar
minikube status
```

**Opción 2: Docker Desktop**
```bash
# Habilitar Kubernetes en Docker Desktop:
# Settings → Kubernetes → Enable Kubernetes → Apply & Restart
```

**Opción 3: Kind (Kubernetes in Docker)**
```bash
# Instalar kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Crear cluster
kind create cluster --name pokemon-cluster
```

### Instalar kubectl
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verificar
kubectl version --client
```

### Desplegar la Aplicación

```bash
# 1. Asegurarse que las imágenes Docker existen localmente
docker images | grep proyecto-infra

# 2. Si usas minikube, cargar las imágenes
minikube image load proyecto-infra-backend:latest
minikube image load proyecto-infra-frontend:latest

# 3. Aplicar todos los manifiestos
kubectl apply -f kubernetes/

# O aplicarlos en orden:
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/postgres-config.yaml
kubectl apply -f kubernetes/postgres-init-configmap.yaml
kubectl apply -f kubernetes/postgres-pvc.yaml
kubectl apply -f kubernetes/postgres-deployment.yaml
kubectl apply -f kubernetes/postgres-service.yaml
kubectl apply -f kubernetes/backend-config.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

# 4. Verificar el despliegue
kubectl get all -n pokemon-app
```

## 🔍 Comandos Útiles

### Ver estado de recursos
```bash
# Ver todos los recursos
kubectl get all -n pokemon-app

# Ver pods con más detalles
kubectl get pods -n pokemon-app -o wide

# Ver servicios
kubectl get services -n pokemon-app

# Ver logs
kubectl logs -f deployment/backend -n pokemon-app
kubectl logs -f deployment/frontend -n pokemon-app
kubectl logs -f deployment/postgres -n pokemon-app

# Describir un pod
kubectl describe pod <pod-name> -n pokemon-app
```

### Escalar Backend
```bash
# Escalar a 5 réplicas
kubectl scale deployment backend --replicas=5 -n pokemon-app

# Verificar réplicas
kubectl get deployment backend -n pokemon-app

# Ver distribución de pods
kubectl get pods -n pokemon-app -l app=backend
```

### Acceder a la aplicación

**Con Minikube:**
```bash
# Obtener URL del servicio
minikube service frontend-service -n pokemon-app --url

# O usar port-forward
kubectl port-forward service/frontend-service 3000:80 -n pokemon-app
# Acceder a: http://localhost:3000
```

**Con Docker Desktop / Kind:**
```bash
# Port forward
kubectl port-forward service/frontend-service 3000:80 -n pokemon-app

# Backend (opcional)
kubectl port-forward service/backend-service 4000:4000 -n pokemon-app
```

### Ejecutar comandos en pods
```bash
# Acceder a shell de PostgreSQL
kubectl exec -it deployment/postgres -n pokemon-app -- psql -U postgres -d pokemon_db

# Ver datos
kubectl exec -it deployment/postgres -n pokemon-app -- psql -U postgres -d pokemon_db -c "SELECT COUNT(*) FROM pokemon;"

# Shell en backend
kubectl exec -it deployment/backend -n pokemon-app -- sh
```

## 🧪 Pruebas

### Verificar conectividad
```bash
# Desde un pod temporal
kubectl run -it --rm debug --image=alpine --restart=Never -n pokemon-app -- sh

# Dentro del pod:
apk add curl
curl http://backend-service:4000/health
curl http://backend-service:4000/api/pokemon
```

### Probar escalabilidad
```bash
# Ver réplicas actuales
kubectl get deployment backend -n pokemon-app

# Escalar
kubectl scale deployment backend --replicas=5 -n pokemon-app

# Ver distribución
kubectl get pods -n pokemon-app -l app=backend -o wide

# Probar que el load balancer distribuye
for i in {1..10}; do kubectl exec deployment/backend -n pokemon-app -- hostname; done
```

### Verificar persistencia
```bash
# Eliminar pod de PostgreSQL
kubectl delete pod -l app=postgres -n pokemon-app

# Esperar que se recree
kubectl get pods -n pokemon-app -w

# Verificar que los datos persisten
kubectl exec -it deployment/postgres -n pokemon-app -- psql -U postgres -d pokemon_db -c "SELECT COUNT(*) FROM pokemon;"
```

## 🗑️ Limpieza

```bash
# Eliminar todo el namespace (borra todos los recursos)
kubectl delete namespace pokemon-app

# O eliminar recursos específicos
kubectl delete -f kubernetes/

# Detener minikube
minikube stop

# Eliminar minikube
minikube delete
```

## 📊 Recursos Configurados

| Componente | Réplicas | CPU Request | Memory Request | CPU Limit | Memory Limit |
|------------|----------|-------------|----------------|-----------|--------------|
| PostgreSQL | 1 | 250m | 256Mi | 500m | 512Mi |
| Backend | **3** | 100m | 128Mi | 200m | 256Mi |
| Frontend | 1 | 50m | 64Mi | 100m | 128Mi |

## 🔐 Seguridad

- ✅ Secrets para credenciales de base de datos
- ✅ ConfigMaps para configuración no sensible
- ✅ Namespace isolation
- ✅ Resource limits configurados
- ✅ Health checks (liveness/readiness probes)

## 📈 Alta Disponibilidad

- ✅ **Backend con 3 réplicas** - Load balancing automático
- ✅ Load Balancer interno de Kubernetes distribuye tráfico
- ✅ Health checks automáticos
- ✅ Auto-restart de pods fallidos
- ✅ Almacenamiento persistente para PostgreSQL

## 🎯 Diferencias vs Docker Compose

| Característica | Docker Compose | Kubernetes |
|----------------|----------------|------------|
| Escalabilidad | Manual | Automática |
| Load Balancing | Externo | Integrado |
| Health Checks | Básico | Avanzado (liveness/readiness) |
| Auto-healing | No | Sí |
| Orquestación | Básica | Avanzada |
| Producción | No recomendado | Sí |

## 📝 Notas

- Las imágenes usan `imagePullPolicy: Never` porque son locales
- Para producción, subir imágenes a Docker Hub o ACR
- El StorageClass `standard` debe existir en el cluster
- El frontend necesita conocer la URL del backend (configurar en build)

## 🚀 Próximo Paso

Después de probar Kubernetes local, el siguiente paso es migrar a **Azure Cloud** con:
- Azure Kubernetes Service (AKS)
- Azure Container Registry (ACR)
- Azure Database for PostgreSQL
- Azure Load Balancer

---

**¡La aplicación está lista para Kubernetes!** 🎮
