# 🌐 Guía Completa de Despliegue en Azure Cloud

## 📋 Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Instalación de Azure CLI](#instalación-de-azure-cli)
3. [Configuración Inicial](#configuración-inicial)
4. [Paso 1: Crear Resource Group](#paso-1-crear-resource-group)
5. [Paso 2: Crear Azure Container Registry](#paso-2-crear-azure-container-registry)
6. [Paso 3: Subir Imágenes Docker](#paso-3-subir-imágenes-docker)
7. [Paso 4: Crear Azure PostgreSQL](#paso-4-crear-azure-postgresql)
8. [Paso 5: Crear Azure Kubernetes Service](#paso-5-crear-azure-kubernetes-service)
9. [Paso 6: Desplegar Aplicación](#paso-6-desplegar-aplicación)
10. [Paso 7: Configurar Load Balancer](#paso-7-configurar-load-balancer)
11. [Paso 8: Verificación y Pruebas](#paso-8-verificación-y-pruebas)
12. [Comandos de Limpieza](#comandos-de-limpieza)

---

## 📦 Prerrequisitos

### ✅ Requisitos:
- [ ] Cuenta de Azure (puede ser gratuita - Azure Free Tier)
- [ ] Imágenes Docker construidas localmente
- [ ] Internet estable
- [ ] 1-2 horas de tiempo
- [ ] Tarjeta de crédito (solo para verificación, no se cobra con Free Tier)

### 💰 Costos Estimados:
- **Azure Free Tier**: Incluye $200 USD de crédito por 30 días
- **AKS**: ~$0.10/hora por nodo (3 nodos ≈ $22/mes)
- **PostgreSQL**: ~$0.05/hora (≈ $36/mes)
- **Container Registry**: Básico $0.167/día (≈ $5/mes)
- **Total estimado**: ~$63/mes (GRATIS con créditos de prueba)

---

## 🔧 Instalación de Azure CLI

### En Linux (Debian/Ubuntu):
```bash
# 1. Actualizar repositorios
sudo apt-get update

# 2. Instalar dependencias
sudo apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg

# 3. Descargar e instalar clave de Microsoft
curl -sL https://packages.microsoft.com/keys/microsoft.asc | \
    gpg --dearmor | \
    sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null

# 4. Agregar repositorio de Azure CLI
AZ_REPO=$(lsb_release -cs)
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | \
    sudo tee /etc/apt/sources.list.d/azure-cli.list

# 5. Actualizar e instalar
sudo apt-get update
sudo apt-get install -y azure-cli

# 6. Verificar instalación
az --version
```

### En macOS:
```bash
brew update && brew install azure-cli
az --version
```

### En Windows:
```powershell
# Descargar instalador desde:
# https://aka.ms/installazurecliwindows
# O usar Chocolatey:
choco install azure-cli
```

---

## 🚀 Configuración Inicial

### 1. Login en Azure
```bash
# Abrir navegador para autenticación
az login

# Seleccionar suscripción (si tienes varias)
az account list --output table
az account set --subscription "NOMBRE_O_ID_DE_TU_SUSCRIPCIÓN"

# Verificar cuenta activa
az account show --output table
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo de configuración
cat > azure-config.sh << 'EOF'
#!/bin/bash

# ============================================
# CONFIGURACIÓN AZURE - PROYECTO POKÉMON
# ============================================

# Información general
export RESOURCE_GROUP="rg-pokemon-app"
export LOCATION="eastus"  # Cambiar según tu región preferida
export PROJECT_NAME="pokemon"

# Azure Container Registry
export ACR_NAME="pokemonacr${RANDOM}"  # Debe ser único globalmente
export ACR_SKU="Basic"

# Azure Kubernetes Service
export AKS_NAME="pokemon-aks"
export AKS_NODE_COUNT=3
export AKS_NODE_SIZE="Standard_B2s"  # 2 vCPU, 4GB RAM
export KUBERNETES_VERSION="1.28"

# Azure Database for PostgreSQL
export POSTGRES_SERVER_NAME="pokemon-db-${RANDOM}"  # Debe ser único
export POSTGRES_ADMIN_USER="adminpokemon"
export POSTGRES_ADMIN_PASSWORD="Pokemon123!Strong"
export POSTGRES_DATABASE="pokemon_db"
export POSTGRES_SKU="Standard_B1ms"  # 1 vCore, 2GB RAM
export POSTGRES_VERSION="16"
export POSTGRES_STORAGE_SIZE=32  # GB

# Tags para organización
export TAGS="project=pokemon environment=production course=infraestructura"

echo "✅ Variables de entorno configuradas"
echo "📍 Resource Group: $RESOURCE_GROUP"
echo "📍 Location: $LOCATION"
echo "📍 ACR: $ACR_NAME"
echo "📍 AKS: $AKS_NAME"
echo "📍 PostgreSQL: $POSTGRES_SERVER_NAME"
EOF

# Dar permisos y cargar variables
chmod +x azure-config.sh
source azure-config.sh
```

---

## 📁 Paso 1: Crear Resource Group

```bash
# 1. Crear el Resource Group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags $TAGS

# 2. Verificar creación
az group show --name $RESOURCE_GROUP --output table

# 3. Listar todos los resource groups
az group list --output table
```

**Captura de pantalla:** Guarda la salida del comando `az group show` para el informe.

---

## 🐳 Paso 2: Crear Azure Container Registry

```bash
# 1. Crear ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku $ACR_SKU \
  --location $LOCATION \
  --admin-enabled true

# 2. Obtener credenciales
az acr credential show --name $ACR_NAME --output table

# 3. Login en ACR
az acr login --name $ACR_NAME

# 4. Verificar
az acr show --name $ACR_NAME --query loginServer --output tsv
```

**Nota:** Guarda las credenciales en un lugar seguro.

---

## 📤 Paso 3: Subir Imágenes Docker

```bash
# 1. Obtener URL del ACR
export ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
echo "ACR URL: $ACR_LOGIN_SERVER"

# 2. Tag de las imágenes locales
docker tag proyecto-infra-backend:latest $ACR_LOGIN_SERVER/pokemon-backend:v1
docker tag proyecto-infra-frontend:latest $ACR_LOGIN_SERVER/pokemon-frontend:v1

# 3. Verificar tags
docker images | grep $ACR_LOGIN_SERVER

# 4. Push de imágenes a ACR
docker push $ACR_LOGIN_SERVER/pokemon-backend:v1
docker push $ACR_LOGIN_SERVER/pokemon-frontend:v1

# 5. Verificar imágenes en ACR
az acr repository list --name $ACR_NAME --output table
az acr repository show-tags --name $ACR_NAME --repository pokemon-backend --output table
az acr repository show-tags --name $ACR_NAME --repository pokemon-frontend --output table
```

**Tiempo estimado:** 5-10 minutos (depende de velocidad de internet)

**Captura de pantalla:** `az acr repository list` para el informe.

---

## 🗄️ Paso 4: Crear Azure PostgreSQL

```bash
# 1. Crear servidor PostgreSQL
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER_NAME \
  --location $LOCATION \
  --admin-user $POSTGRES_ADMIN_USER \
  --admin-password $POSTGRES_ADMIN_PASSWORD \
  --sku-name $POSTGRES_SKU \
  --tier Burstable \
  --version $POSTGRES_VERSION \
  --storage-size $POSTGRES_STORAGE_SIZE \
  --public-access 0.0.0.0 \
  --tags $TAGS

# 2. Crear base de datos
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER_NAME \
  --database-name $POSTGRES_DATABASE

# 3. Configurar firewall (permitir servicios de Azure)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER_NAME \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 4. Obtener connection string
export POSTGRES_HOST="${POSTGRES_SERVER_NAME}.postgres.database.azure.com"
export POSTGRES_CONNECTION_STRING="postgresql://${POSTGRES_ADMIN_USER}:${POSTGRES_ADMIN_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DATABASE}?sslmode=require"

echo "Connection String: $POSTGRES_CONNECTION_STRING"

# 5. Verificar conexión (requiere psql instalado)
sudo apt-get install -y postgresql-client
psql "$POSTGRES_CONNECTION_STRING" -c "SELECT version();"
```

**Tiempo estimado:** 5-10 minutos

### Cargar datos iniciales:
```bash
# Descargar scripts locales
cd /home/carp/Documentos/proyecto-infra

# Conectar y ejecutar scripts
psql "$POSTGRES_CONNECTION_STRING" < database/init.sql
psql "$POSTGRES_CONNECTION_STRING" < database/seed.sql

# Verificar datos
psql "$POSTGRES_CONNECTION_STRING" -c "SELECT COUNT(*) FROM pokemon;"
```

**Captura de pantalla:** Conexión exitosa y count de pokémon.

---

## ☸️ Paso 5: Crear Azure Kubernetes Service

```bash
# 1. Crear cluster AKS
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --node-count $AKS_NODE_COUNT \
  --node-vm-size $AKS_NODE_SIZE \
  --kubernetes-version $KUBERNETES_VERSION \
  --enable-managed-identity \
  --generate-ssh-keys \
  --attach-acr $ACR_NAME \
  --load-balancer-sku standard \
  --network-plugin azure \
  --tags $TAGS

# 2. Obtener credenciales de kubectl
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --overwrite-existing

# 3. Verificar conexión
kubectl cluster-info
kubectl get nodes

# 4. Verificar integración con ACR
az aks check-acr \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --acr $ACR_NAME
```

**Tiempo estimado:** 10-15 minutos

**Captura de pantalla:** `kubectl get nodes` mostrando 3 nodos.

---

## 🚀 Paso 6: Desplegar Aplicación

### 1. Crear Manifiestos Azure

```bash
# Crear directorio azure-k8s
cd /home/carp/Documentos/proyecto-infra
mkdir -p azure-k8s
cd azure-k8s
```

#### `namespace.yaml`
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pokemon-app
  labels:
    name: pokemon-app
    environment: production
```

#### `secrets.yaml`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: pokemon-app
type: Opaque
stringData:
  POSTGRES_HOST: "<POSTGRES_SERVER_NAME>.postgres.database.azure.com"
  POSTGRES_USER: "adminpokemon"
  POSTGRES_PASSWORD: "Pokemon123!Strong"
  POSTGRES_DATABASE: "pokemon_db"
  POSTGRES_PORT: "5432"
```

**⚠️ IMPORTANTE:** Reemplaza `<POSTGRES_SERVER_NAME>` con tu valor real.

#### `backend-deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: pokemon-app
  labels:
    app: backend
    tier: api
spec:
  replicas: 3  # ✅ TRES RÉPLICAS
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
        tier: api
    spec:
      containers:
      - name: backend
        image: <ACR_LOGIN_SERVER>/pokemon-backend:v1
        ports:
        - containerPort: 4000
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_HOST
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_PASSWORD
        - name: DB_NAME
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_DATABASE
        - name: DB_PORT
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_PORT
        - name: PORT
          value: "4000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**⚠️ IMPORTANTE:** Reemplaza `<ACR_LOGIN_SERVER>` con tu valor real.

#### `backend-service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: pokemon-app
spec:
  type: LoadBalancer
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 4000
    protocol: TCP
    name: http
```

#### `frontend-deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: pokemon-app
  labels:
    app: frontend
    tier: presentation
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        tier: presentation
    spec:
      containers:
      - name: frontend
        image: <ACR_LOGIN_SERVER>/pokemon-frontend:v1
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

**⚠️ IMPORTANTE:** Reemplaza `<ACR_LOGIN_SERVER>` con tu valor real.

#### `frontend-service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: pokemon-app
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
```

### 2. Aplicar Manifiestos

```bash
# Reemplazar valores en los manifiestos
export ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
export POSTGRES_HOST="${POSTGRES_SERVER_NAME}.postgres.database.azure.com"

# Reemplazar en todos los archivos
sed -i "s|<ACR_LOGIN_SERVER>|${ACR_LOGIN_SERVER}|g" azure-k8s/*.yaml
sed -i "s|<POSTGRES_SERVER_NAME>|${POSTGRES_SERVER_NAME}|g" azure-k8s/*.yaml

# Aplicar manifiestos
kubectl apply -f azure-k8s/namespace.yaml
kubectl apply -f azure-k8s/secrets.yaml
kubectl apply -f azure-k8s/backend-deployment.yaml
kubectl apply -f azure-k8s/backend-service.yaml
kubectl apply -f azure-k8s/frontend-deployment.yaml
kubectl apply -f azure-k8s/frontend-service.yaml

# Ver estado
kubectl get all -n pokemon-app
```

---

## 🔍 Paso 7: Configurar Load Balancer

```bash
# 1. Esperar a que se asignen IPs públicas
kubectl get services -n pokemon-app --watch

# 2. Obtener IP pública del backend
export BACKEND_IP=$(kubectl get service backend-service -n pokemon-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Backend IP: $BACKEND_IP"

# 3. Obtener IP pública del frontend
export FRONTEND_IP=$(kubectl get service frontend-service -n pokemon-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend IP: $FRONTEND_IP"

# 4. Probar acceso
curl http://$BACKEND_IP/health
curl http://$BACKEND_IP/api/pokemon | jq '.count'
```

---

## ✅ Paso 8: Verificación y Pruebas

### Verificar Réplicas
```bash
# Ver pods
kubectl get pods -n pokemon-app -o wide

# Ver distribución de réplicas
kubectl get deployment backend -n pokemon-app

# Escalar (opcional)
kubectl scale deployment backend --replicas=5 -n pokemon-app
```

### Probar Load Balancing
```bash
# Hacer múltiples requests y ver qué pod responde
for i in {1..10}; do
  kubectl exec -n pokemon-app deployment/backend -- hostname
done | sort | uniq -c
```

### Probar API
```bash
# Listar Pokémon
curl http://$BACKEND_IP/api/pokemon | jq '.data[:3]'

# Crear Pokémon
curl -X POST http://$BACKEND_IP/api/pokemon \
  -H "Content-Type: application/json" \
  -d '{
    "numero_pokedex": 888,
    "nombre": "Azure Test",
    "tipo_primario": "Acero",
    "descripcion": "Pokémon de prueba en Azure",
    "stats_hp": 100,
    "stats_ataque": 100,
    "stats_defensa": 100,
    "stats_velocidad": 100,
    "generacion": 8
  }' | jq '.'
```

### Verificar Aplicación Web
```bash
echo "Accede a la aplicación en: http://$FRONTEND_IP"
```

**Captura de pantalla:** Aplicación funcionando con la IP pública de Azure.

---

## 📊 Monitoreo y Logs

```bash
# Ver logs de backend
kubectl logs -f deployment/backend -n pokemon-app

# Ver logs de frontend
kubectl logs -f deployment/frontend -n pokemon-app

# Ver eventos del cluster
kubectl get events -n pokemon-app --sort-by='.lastTimestamp'

# Describir pod específico
kubectl describe pod <POD_NAME> -n pokemon-app

# Ver métricas (si está habilitado)
kubectl top nodes
kubectl top pods -n pokemon-app
```

---

## 🗑️ Comandos de Limpieza

### Eliminar solo la aplicación
```bash
kubectl delete namespace pokemon-app
```

### Eliminar todo el Resource Group (CUIDADO)
```bash
# Esto eliminará TODOS los recursos
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

### Eliminar recursos individuales
```bash
# Eliminar AKS
az aks delete --resource-group $RESOURCE_GROUP --name $AKS_NAME --yes

# Eliminar PostgreSQL
az postgres flexible-server delete --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER_NAME --yes

# Eliminar ACR
az acr delete --resource-group $RESOURCE_GROUP --name $ACR_NAME --yes

# Finalmente eliminar Resource Group
az group delete --name $RESOURCE_GROUP --yes
```

---

## 📝 Checklist Final

- [ ] Resource Group creado
- [ ] ACR creado y funcionando
- [ ] Imágenes subidas a ACR
- [ ] PostgreSQL creado y con datos
- [ ] AKS creado con 3 nodos
- [ ] Backend desplegado con 3 réplicas
- [ ] Frontend desplegado
- [ ] Load Balancers asignados
- [ ] API accesible públicamente
- [ ] Aplicación web accesible
- [ ] Capturas de pantalla tomadas
- [ ] IPs públicas documentadas

---

## 🎯 Resumen de Recursos Creados

| Recurso | Nombre | Tipo | Costo/Mes |
|---------|--------|------|-----------|
| Resource Group | rg-pokemon-app | Contenedor | Gratis |
| ACR | pokemonacr[random] | Basic | ~$5 |
| AKS | pokemon-aks | 3 nodos B2s | ~$22 |
| PostgreSQL | pokemon-db-[random] | B1ms | ~$36 |
| Load Balancers | 2 | Standard | ~$18 |
| **TOTAL** | - | - | **~$81/mes** |

**Con Azure Free Tier:** $200 de crédito = ~2.5 meses gratis

---

## 🆘 Troubleshooting

### Error: ACR name already exists
```bash
# Genera un nuevo nombre único
export ACR_NAME="pokemonacr$(date +%s)"
```

### Error: Cannot pull image from ACR
```bash
# Reattach ACR al AKS
az aks update \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --attach-acr $ACR_NAME
```

### Error: Backend no se conecta a PostgreSQL
```bash
# Verificar firewall
az postgres flexible-server firewall-rule list \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER_NAME

# Verificar secrets
kubectl get secret postgres-secret -n pokemon-app -o yaml
```

### Pods en estado CrashLoopBackOff
```bash
# Ver logs detallados
kubectl logs <POD_NAME> -n pokemon-app --previous
kubectl describe pod <POD_NAME> -n pokemon-app
```

---

## 📸 Capturas Requeridas para el Informe

1. ✅ Azure Portal - Resource Group con todos los recursos
2. ✅ ACR - Lista de repositorios
3. ✅ AKS - Nodos funcionando
4. ✅ PostgreSQL - Conexión exitosa
5. ✅ `kubectl get all -n pokemon-app`
6. ✅ `kubectl get pods -o wide` mostrando 3 réplicas backend
7. ✅ Load Balancer IPs públicas
8. ✅ Aplicación web funcionando en el navegador
9. ✅ API respondiendo (curl o Postman)
10. ✅ Azure Portal - Métricas de uso

---

**¡Listo! Con esta guía puedes desplegar completamente la aplicación en Azure Cloud.** ☁️🎮
