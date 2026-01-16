# 1. Etapa de construcción (Build)
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Etapa de producción
FROM node:20
WORKDIR /app

# Instalamos serve globalmente en la imagen completa
RUN npm install -g serve

# Copiamos la carpeta compilada
COPY --from=build /app/dist ./dist

# Usamos la ruta directa para evitar errores de PATH
# Y quitamos npx para usar serve directamente
CMD ["serve", "-s", "dist", "-l", "8080", "-a", "0.0.0.0"]
