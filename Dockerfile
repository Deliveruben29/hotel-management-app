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

# Copiamos los archivos directamente a la raíz de trabajo
COPY --from=build /app/dist .

# El comando más simple posible:
CMD ["serve", "-s", ".", "8080"]
