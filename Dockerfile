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
# Instalamos serve de forma que sea accesible siempre
RUN npm install -g serve
COPY --from=build /app/dist ./dist

# ESTO ES LO NUEVO: Aseguramos que el puerto sea el que Google quiere
ENV PORT 8080
EXPOSE 8080

# Usamos la ruta completa del binario para que no haya dudas
CMD ["serve", "-s", "dist", "-l", "8080"]
