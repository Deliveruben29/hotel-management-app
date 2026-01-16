# Etapa 1: Construcción (¡No borres esto!)
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2
FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist .
CMD ["serve", "-s", ".", "8080"]
