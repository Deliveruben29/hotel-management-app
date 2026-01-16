# Etapa 1: Construcción (¡No borres esto!)
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:20-slim
WORKDIR /app

# Instalamos el servidor
RUN npm install -g serve

# Copiamos la carpeta dist que se creó en la Etapa 1
COPY --from=build /app/dist ./dist

# Comando final LIMPIO (sin -a ni -l)
CMD ["serve", "-s", "dist", "8080"]
