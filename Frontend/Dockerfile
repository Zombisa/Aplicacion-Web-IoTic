# Etapa 1: Build Angular
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

# Copiar el build generado
COPY --from=build /app/dist/Web-IoTic-Front/browser /usr/share/nginx/html

# Copiar nginx personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf
