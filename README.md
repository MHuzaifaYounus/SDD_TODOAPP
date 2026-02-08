# Deployment Instructions: Serverless Frontend Application

This document provides instructions for building and deploying the React+Vite frontend application to a local Minikube Kubernetes cluster.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js (v18+)** and **npm**: For building the React application.
-   **Docker**: For building container images.
-   **Minikube**: A local Kubernetes cluster.
-   **kubectl**: The Kubernetes command-line tool.
-   **A web browser**: For accessing the deployed application.

## Project Structure (Relevant Files)

-   `deploy.sh`: Automation script for building, deploying, and opening the application.
-   `frontend/Dockerfile`: Defines the multi-stage Docker build for the React application.
-   `frontend/nginx.conf`: Nginx configuration for serving the React app and handling client-side routing.
-   `k8s/deployment.yaml`: Kubernetes Deployment manifest for the frontend application.
-   `k8s/service.yaml`: Kubernetes Service (NodePort) manifest to expose the application.
-   `.env`: (Optional) Local environment variables that will be baked into the Docker image.

## Deployment Steps

1.  **Start Minikube**:
    Ensure your Minikube cluster is running. If not, start it using:
    ```bash
    minikube start
    ```

2.  **Navigate to the project root**:
    ```bash
    cd /path/to/your/project/root
    ```

3.  **Create a `.env` file (Optional)**:
    If your application requires environment variables like `VITE_GEMINI_API_KEY` or `VITE_DB_URL` during the build process, create a `.env` file in the project root:
    ```
    VITE_GEMINI_API_KEY=your_gemini_api_key
    VITE_DB_URL=your_database_url
    ```
    These variables will be automatically passed as build arguments to the `Dockerfile`.

4.  **Run the deployment script**:
    Execute the `deploy.sh` script to build the Docker image, apply Kubernetes manifests, and open the application in your browser:
    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```
    The script will:
    -   Verify Minikube status.
    -   Set your shell to use Minikube's Docker daemon.
    -   Build the `todo-app:latest` Docker image.
    -   Apply `k8s/deployment.yaml` and `k8s/service.yaml`.
    -   Retrieve the application's NodePort URL.
    -   Open the application URL in your default web browser.

## Verifying Deployment

After the script completes, the application should open in your browser. You can manually verify:

-   **Accessibility**: Ensure the application loads correctly in the browser.
-   **Client-Side Routing**: Navigate to different routes within the application (e.g., `/dashboard`, `/settings`) and try refreshing the page. The application should load correctly without 404 errors, indicating Nginx is properly handling React Router.
-   **Kubernetes Resources**: You can check the deployed resources using `kubectl`:
    ```bash
    kubectl get deployments
    kubectl get services
    kubectl get pods
    ```

## Troubleshooting

-   **Minikube not running**: The `deploy.sh` script will detect this and exit. Start Minikube with `minikube start`.
-   **Docker build failures**: Check the console output for errors during the `docker build` step. Ensure `npm install` and `npm run build` succeed locally.
-   **Kubernetes deployment issues**: Use `kubectl describe deployment todo-app-deployment` or `kubectl logs <pod-name>` to inspect issues.
-   **Application not opening**: If the browser doesn't open, copy the URL printed by `deploy.sh` (e.g., `http://<minikube-ip>:30000`) and paste it manually into your browser.
