FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build Angular app
RUN npm run build

# Nginx server for production
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/pulseapi /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
