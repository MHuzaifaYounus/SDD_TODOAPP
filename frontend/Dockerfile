FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# FIX: Force install of devDependencies so vite is available
RUN npm install --include=dev

# Copy the rest of the code
COPY . .

# Now vite will be found
RUN npx vite build


# Stage 2: Serve
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 1. Copy the built files
COPY --from=builder /app/dist .

# 2. Copy Nginx config (Ensure this file exists in your project root)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]