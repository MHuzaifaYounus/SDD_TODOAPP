# Research Findings: Serverless Frontend Deployment

**Feature Branch**: `001-serverless-frontend-deploy`  
**Date**: 2026-02-07  
**Spec**: ../spec.md

## 1. Nginx Configuration for React Router (Client-Side Routing)

### Problem
When deploying single-page applications (SPAs) like React apps, refreshing the page or directly navigating to a client-side route often results in a 404 "Not Found" error if the web server (e.g., Nginx) is not configured to redirect all such requests to the SPA's `index.html`. This is because the server attempts to find a physical file matching the route, which doesn't exist for client-side routes.

### Decision
Implement a custom `nginx.conf` that redirects all non-file/non-directory requests to `index.html`.

### Rationale
This is the standard and most robust approach to ensure client-side routing works correctly for React Router. It allows React Router to take over and handle the routing within the application.

### Alternatives Considered
-   **Hash-based routing (e.g., `example.com/#/path`)**: Avoided as it's less user-friendly, can have SEO implications, and is generally considered an older pattern.
-   **Server-side rendering (SSR)**: Out of scope for a "serverless frontend" deployment focused on static assets served by Nginx.

### Best Practice Configuration Example (nginx.conf)
```nginx
server {
    listen 80;
    server_name localhost; # Or your domain

    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
*   `try_files $uri $uri/ /index.html;`: This directive is crucial. It first tries to serve a file (`$uri`), then a directory (`$uri/`), and if neither is found, it falls back to serving `index.html`.

## 2. Docker Multi-Stage Build for React/Vite Application

### Problem
Creating efficient and secure Docker images for frontend applications requires minimizing the final image size and reducing attack surface. A single-stage build often results in large images containing build tools and development dependencies.

### Decision
Use a multi-stage Docker build process.

### Rationale
Multi-stage builds allow us to separate the build environment from the runtime environment. This significantly reduces the final image size by discarding build-time dependencies (like `node_modules`, compilers) that are not needed at runtime. It also improves security by shipping only the necessary production artifacts.

### Alternatives Considered
-   **Single-stage build**: Results in larger images and includes unnecessary development dependencies. Rejected due to inefficiency.

### Best Practice Configuration Example (Dockerfile snippet)
```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_GEMINI_API_KEY
ARG VITE_DB_URL

ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_DB_URL=$VITE_DB_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Runner
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 3. Minikube Deployment for React Application

### Problem
Deploying the containerized React application to a local Kubernetes environment (Minikube) requires defining Kubernetes objects (Deployment, Service) and an automation script to streamline the process.

### Decision
Create Kubernetes Deployment and Service manifests, and an automation script (`deploy.sh`).

### Rationale
Kubernetes provides a robust way to manage containerized applications. Using Minikube enables local development and testing in a Kubernetes-native environment. An automation script simplifies the build and deployment workflow for developers.

### Alternatives Considered
-   **Manual `kubectl` commands**: Too cumbersome and error-prone for repeated deployments. Rejected for automation goals.
-   **Other local Kubernetes tools (e.g., Kind, Docker Desktop Kubernetes)**: Minikube was specified in the initial requirements, so adherence to that.

### Best Practice Considerations for deploy.sh
-   **Minikube Docker environment**: Ensure the shell uses Minikube's Docker daemon for image builds.
-   **Environment variable injection**: Pass local `.env` variables as build arguments to the Docker build process.
-   **Kubernetes manifests**: Apply deployment and service definitions.
-   **Service URL opening**: Automatically open the NodePort URL for convenience.
