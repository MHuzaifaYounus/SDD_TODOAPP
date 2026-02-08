#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
APP_NAME="todo-app"
FRONTEND_DIR="frontend"
K8S_DIR="k8s"
DOCKERFILE="${FRONTEND_DIR}/Dockerfile"
DEPLOYMENT_MANIFEST="${K8S_DIR}/deployment.yaml"
SERVICE_MANIFEST="${K8S_DIR}/service.yaml"
# NodePort for the service, should match k8s/service.yaml
NODE_PORT=30000 

# --- Functions ---

check_minikube_status() {
    echo "Checking Minikube status..."
    if ! minikube status &> /dev/null; then
        echo "Minikube is not running. Please start Minikube (e.g., 'minikube start') and try again."
        exit 1
    fi
    echo "Minikube is running."
}

set_minikube_docker_env() {
    echo "Setting Minikube's Docker environment..."
    eval $(minikube docker-env)
    echo "Minikube's Docker environment set."
}

build_docker_image() {
    echo "Building Docker image for ${APP_NAME}..."
    # Read .env file and pass variables as build arguments
    BUILD_ARGS=""
    if [ -f ".env" ]; then
        echo "Reading .env file for build arguments..."
        while IFS='=' read -r key value; do
            if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
                BUILD_ARGS+="--build-arg $key=\"$value\" "
            fi
        done < .env
    else
        echo "No .env file found. Proceeding without build arguments from .env."
    fi

    # Ensure to pass the --file argument for the Dockerfile path
    docker build -t ${APP_NAME}:latest -f "${DOCKERFILE}" ${BUILD_ARGS} "${FRONTEND_DIR}"
    echo "Docker image ${APP_NAME}:latest built."
}

apply_kubernetes_manifests() {
    echo "Applying Kubernetes manifests..."
    kubectl apply -f "${DEPLOYMENT_MANIFEST}"
    kubectl apply -f "${SERVICE_MANIFEST}"
    echo "Kubernetes manifests applied."
}

open_app_url() {
    echo "Waiting for service to be available and getting URL..."
    # Get the minikube IP
    MINIKUBE_IP=$(minikube ip)
    APP_URL="http://${MINIKUBE_IP}:${NODE_PORT}"

    echo "Application should be available at: ${APP_URL}"
    # Give some time for the service to be ready
    sleep 5
    xdg-open "${APP_URL}" || open "${APP_URL}" || start "${APP_URL}"
    echo "Opened application URL in browser."
}

# --- Main Script Execution ---
echo "Starting deployment process for ${APP_NAME}..."

check_minikube_status
set_minikube_docker_env
build_docker_image
apply_kubernetes_manifests
open_app_url

echo "Deployment process completed."
