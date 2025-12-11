# Etapa 1: Build de Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

RUN npm install

# Copiar el resto del código
COPY . .

# Build de producción (ajusta si tu script es distinto)
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:1.27-alpine

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar build de Angular
COPY --from=build /app/dist/Web-IoTic-Front/browser/ /usr/share/nginx/html/

# Renombrar index.csr.html a index.html para nginx
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
