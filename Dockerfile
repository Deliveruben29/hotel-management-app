# Etapa 1: Construcción
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Aquí está el truco)
FROM node:20-slim
WORKDIR /app

# Instalamos un servidor estático que NO dependa de Vite
RUN npm install -g serve

# Copiamos SOLO lo necesario del build
COPY --from=build /app/dist ./dist

# EXTREMADAMENTE IMPORTANTE: Usamos 'serve' para entregar los archivos
# El puerto 8080 ahora sí responderá porque 'serve' no necesita dependencias de desarrollo
CMD ["serve", "-s", "dist", "8080"]
