# 🚀 COMANDOS PARA CORRER EL PROYECTO EN LOCAL

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Docker** (versión 20+)
- ✅ **Docker Compose** (versión 2.0+)

Verifica con:
```bash
docker --version
docker-compose --version
```

---

## ⚡ OPCIÓN 1: Docker Compose (Más Fácil)

### Paso 1: Ir al directorio del proyecto

```bash
cd /home/carp/Documentos/proyecto-infra
```

### Paso 2: Construir e iniciar todos los servicios

```bash
docker-compose up --build -d
```

**¿Qué hace este comando?**
- `up`: Inicia los servicios
- `--build`: Reconstruye las imágenes Docker
- `-d`: Modo detached (segundo plano)

**Tiempo estimado:** 2-3 minutos (primera vez)

### Paso 3: Verificar que todo está funcionando

```bash
# Ver estado de los servicios
docker-compose ps

# Deberías ver algo como:
# NAME                 STATUS          PORTS
# pokemon-postgres     Up 30 seconds   0.0.0.0:5432->5432/tcp
# pokemon-backend      Up 30 seconds   0.0.0.0:4000->4000/tcp
# pokemon-frontend     Up 30 seconds   0.0.0.0:3000->80/tcp
```

### Paso 4: Probar la aplicación

**En tu navegador:**
```
http://localhost:3000
```
Deberías ver la aplicación de Pokémon con la lista de 30 Pokémon.

**API Backend:**
```bash
# Health check
curl http://localhost:4000/health

# Ver todos los Pokémon
curl http://localhost:4000/api/pokemon

# Ver solo legendarios
curl http://localhost:4000/api/pokemon/legendarios
```

### Paso 5: Ver logs (opcional)

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo del frontend
docker-compose logs -f frontend

# Ver logs solo de la base de datos
docker-compose logs -f postgres
```

**Tip:** Presiona `Ctrl + C` para salir de los logs.

### 🛑 Detener la aplicación

```bash
# Detener servicios (mantiene los datos)
docker-compose stop

# Detener y eliminar servicios (mantiene los datos)
docker-compose down

# Detener, eliminar servicios Y eliminar datos
docker-compose down -v
```

### 🔄 Reiniciar después de cambios en el código

```bash
# Si cambias código del backend o frontend
docker-compose up --build -d

# Si solo cambias código sin dependencias nuevas
docker-compose restart backend
docker-compose restart frontend
```

---

## ⚙️ OPCIÓN 2: Kubernetes con Minikube (Avanzado)

### Requisitos Adicionales

- ✅ **Minikube** (versión 1.30+)
- ✅ **kubectl** (versión 1.28+)

### Paso 1: Iniciar Minikube

```bash
# Iniciar cluster de Kubernetes local
minikube start --cpus=4 --memory=8192 --driver=docker

# Verificar que esté corriendo
kubectl cluster-info
kubectl get nodes
```

### Paso 2: Cargar imágenes Docker en Minikube

```bash
# Configurar Docker para usar el daemon de Minikube
eval $(minikube docker-env)

# Ir al directorio del proyecto
cd /home/carp/Documentos/proyecto-infra

# Construir imágenes
docker build -t pokemon-backend:latest -f Dockerfile.backend .
docker build -t pokemon-frontend:latest -f Dockerfile.frontend .

# Verificar imágenes
docker images | grep pokemon
```

### Paso 3: Aplicar manifiestos de Kubernetes

```bash
# Aplicar todos los manifiestos en orden
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/postgres-configmap.yaml
kubectl apply -f kubernetes/postgres-seed-configmap.yaml
kubectl apply -f kubernetes/postgres-secret.yaml
kubectl apply -f kubernetes/postgres-pvc.yaml
kubectl apply -f kubernetes/postgres-deployment.yaml
kubectl apply -f kubernetes/postgres-service.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

# O aplicar todos a la vez
kubectl apply -f kubernetes/
```

### Paso 4: Verificar el despliegue

```bash
# Ver todos los recursos
kubectl get all -n pokemon-app

# Esperar a que todos los pods estén Running
kubectl get pods -n pokemon-app --watch

# Deberías ver algo como:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-759fcddf45-259zz    1/1     Running   0          2m
# backend-759fcddf45-gp9gg    1/1     Running   0          2m
# backend-759fcddf45-l5z5z    1/1     Running   0          2m
# frontend-6b8f9d5c7b-xk2j9   1/1     Running   0          2m
# postgres-7d9c5b6f8d-9mzwv   1/1     Running   0          2m
```

**Nota:** Presiona `Ctrl + C` para salir del watch.

### Paso 5: Cargar datos en PostgreSQL (si no se cargaron automáticamente)

```bash
# Obtener el nombre del pod de postgres
kubectl get pods -n pokemon-app | grep postgres

# Copiar script de seed
kubectl cp database/seed.sql pokemon-app/<POSTGRES_POD_NAME>:/tmp/seed.sql

# Ejecutar script
kubectl exec -n pokemon-app <POSTGRES_POD_NAME> -- psql -U postgres -d pokemon_db -f /tmp/seed.sql

# Verificar datos
kubectl exec -n pokemon-app <POSTGRES_POD_NAME> -- psql -U postgres -d pokemon_db -c "SELECT COUNT(*) FROM pokemon;"
```

### Paso 6: Acceder a la aplicación

```bash
# Obtener URL del backend
minikube service backend-service -n pokemon-app --url

# Obtener URL del frontend
minikube service frontend-service -n pokemon-app --url

# O abrir directamente en el navegador
minikube service frontend-service -n pokemon-app
```

### Paso 7: Probar la API

```bash
# Obtener la URL del backend
export BACKEND_URL=$(minikube service backend-service -n pokemon-app --url)

# Health check
curl $BACKEND_URL/health

# Ver todos los Pokémon
curl $BACKEND_URL/api/pokemon | jq '.count'

# Ver legendarios
curl $BACKEND_URL/api/pokemon/legendarios | jq '.count'
```

### 🛑 Detener Kubernetes

```bash
# Eliminar la aplicación (mantiene el cluster)
kubectl delete namespace pokemon-app

# Detener Minikube
minikube stop

# Eliminar cluster completamente
minikube delete
```

### 🔄 Actualizar después de cambios

```bash
# Reconstruir imagen
eval $(minikube docker-env)
docker build -t pokemon-backend:latest -f Dockerfile.backend .

# Reiniciar deployment
kubectl rollout restart deployment backend -n pokemon-app

# Ver progreso
kubectl rollout status deployment backend -n pokemon-app
```

---

## 🔍 Comandos Útiles de Troubleshooting

### Docker Compose

```bash
# Ver logs con timestamps
docker-compose logs -f --timestamps

# Ver uso de recursos
docker stats

# Reiniciar un servicio específico
docker-compose restart backend

# Entrar al contenedor del backend
docker-compose exec backend sh

# Entrar a PostgreSQL
docker-compose exec postgres psql -U postgres -d pokemon_db

# Ver redes Docker
docker network ls

# Ver volúmenes
docker volume ls

# Limpiar todo (⚠️ CUIDADO: Elimina todo)
docker-compose down -v
docker system prune -a
```

### Kubernetes

```bash
# Ver logs de un pod
kubectl logs -f <POD_NAME> -n pokemon-app

# Ver logs previos (si el pod crasheó)
kubectl logs <POD_NAME> -n pokemon-app --previous

# Describir un pod (ver eventos y errores)
kubectl describe pod <POD_NAME> -n pokemon-app

# Entrar a un pod
kubectl exec -it <POD_NAME> -n pokemon-app -- sh

# Ver eventos del namespace
kubectl get events -n pokemon-app --sort-by='.lastTimestamp'

# Ver uso de recursos
kubectl top nodes
kubectl top pods -n pokemon-app

# Escalar manualmente
kubectl scale deployment backend --replicas=5 -n pokemon-app

# Ver configuración de un servicio
kubectl get service backend-service -n pokemon-app -o yaml

# Port-forward (acceso directo sin LoadBalancer)
kubectl port-forward -n pokemon-app deployment/backend 4000:4000
```

---

## 📊 Verificación Completa (Checklist)

### Docker Compose

```bash
# 1. Servicios corriendo
docker-compose ps
# ✅ Todos deben estar "Up"

# 2. Backend funcionando
curl http://localhost:4000/health
# ✅ Debe responder: {"success":true,"message":"Backend API is running! 🚀"}

# 3. Base de datos con datos
curl http://localhost:4000/api/pokemon | jq '.count'
# ✅ Debe responder: 30

# 4. Frontend accesible
curl -I http://localhost:3000
# ✅ Debe responder: HTTP/1.1 200 OK

# 5. Abrir en navegador
xdg-open http://localhost:3000  # Linux
# ✅ Debe mostrar la aplicación de Pokémon
```

### Kubernetes

```bash
# 1. Cluster corriendo
kubectl cluster-info
# ✅ Debe mostrar URLs del cluster

# 2. Pods corriendo
kubectl get pods -n pokemon-app
# ✅ Todos deben estar "Running" y "1/1 Ready"

# 3. Servicios con IPs
kubectl get services -n pokemon-app
# ✅ backend-service y frontend-service deben tener EXTERNAL-IP

# 4. Backend funcionando
export BACKEND_URL=$(minikube service backend-service -n pokemon-app --url)
curl $BACKEND_URL/health
# ✅ Debe responder: {"success":true,...}

# 5. Datos en la base
curl $BACKEND_URL/api/pokemon | jq '.count'
# ✅ Debe responder: 30

# 6. Frontend accesible
minikube service frontend-service -n pokemon-app
# ✅ Debe abrir el navegador con la aplicación
```

---

## ⚠️ Problemas Comunes y Soluciones

### Docker Compose

**Problema:** "Cannot connect to the Docker daemon"
```bash
# Solución: Iniciar Docker
sudo systemctl start docker
# O si usas Docker Desktop, ábrelo
```

**Problema:** "Port 3000 is already in use"
```bash
# Solución 1: Detener el proceso que usa el puerto
sudo lsof -ti:3000 | xargs kill -9

# Solución 2: Cambiar el puerto en docker-compose.yml
# Cambiar "3000:80" por "3001:80"
```

**Problema:** "Backend no puede conectar a postgres"
```bash
# Solución: Esperar a que postgres esté listo
docker-compose logs postgres
# Busca: "database system is ready to accept connections"

# O reiniciar servicios en orden
docker-compose down
docker-compose up -d postgres
# Esperar 10 segundos
docker-compose up -d backend frontend
```

### Kubernetes

**Problema:** "ImagePullBackOff"
```bash
# Solución: Asegurarse de usar el Docker de Minikube
eval $(minikube docker-env)
docker build -t pokemon-backend:latest -f Dockerfile.backend .

# Verificar que la imagen existe
docker images | grep pokemon

# Reiniciar deployment
kubectl rollout restart deployment backend -n pokemon-app
```

**Problema:** "CrashLoopBackOff"
```bash
# Solución: Ver logs del pod
kubectl logs <POD_NAME> -n pokemon-app

# Ver eventos
kubectl describe pod <POD_NAME> -n pokemon-app

# Común: Backend intenta conectar antes de que postgres esté listo
# Esperar 1-2 minutos y verificar de nuevo
```

**Problema:** "Pending pods"
```bash
# Solución: Ver por qué está pendiente
kubectl describe pod <POD_NAME> -n pokemon-app

# Común: Falta recursos en Minikube
minikube delete
minikube start --cpus=4 --memory=8192
```

---

## 🎯 Resumen de Comandos Esenciales

### Inicio Rápido (Docker Compose)
```bash
cd /home/carp/Documentos/proyecto-infra
docker-compose up --build -d
# Esperar 30 segundos
xdg-open http://localhost:3000
```

### Inicio Rápido (Kubernetes)
```bash
minikube start --cpus=4 --memory=8192
eval $(minikube docker-env)
cd /home/carp/Documentos/proyecto-infra
docker build -t pokemon-backend:latest -f Dockerfile.backend .
docker build -t pokemon-frontend:latest -f Dockerfile.frontend .
kubectl apply -f kubernetes/
# Esperar 2 minutos
minikube service frontend-service -n pokemon-app
```

### Detener Todo
```bash
# Docker Compose
docker-compose down

# Kubernetes
kubectl delete namespace pokemon-app
minikube stop
```

---

## 📚 Siguiente Paso

Una vez que todo esté funcionando localmente, puedes:

1. **Explorar la aplicación:** Crear, editar, eliminar Pokémon
2. **Experimentar con escalado:** `kubectl scale deployment backend --replicas=5 -n pokemon-app`
3. **Ver los logs en tiempo real:** `docker-compose logs -f`
4. **Desplegar en Azure:** Seguir la guía `azure/GUIA_DESPLIEGUE_AZURE.md`

---

**✅ ¡Listo! Tu aplicación de Pokémon está corriendo en local.**
