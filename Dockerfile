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
RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Configuración de red
ENV PORT 8080
EXPOSE 8080

# Comando directo sin comillas problemáticas
CMD ["npx", "serve", "-s", "dist", "-l", "8080"]
