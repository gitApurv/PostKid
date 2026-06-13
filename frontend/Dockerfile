FROM node:alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_PROXY_TARGET=http://backend:8080
EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0"]