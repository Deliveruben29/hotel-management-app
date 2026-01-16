# 1. Construcción
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Servidor de producción
FROM node:20-slim
WORKDIR /app

# Instalamos serve de forma global en esta imagen final
RUN npm install -g serve

# Copiamos la carpeta compilada desde la etapa anterior
COPY --from=build /app/dist ./dist

# EXTREMADAMENTE IMPORTANTE para Cloud Run:
# Escuchar en 0.0.0.0 es lo que evita el error de "failed to listen"
CMD ["serve", "-s", "dist", "-l", "8080", "-a", "0.0.0.0"]
