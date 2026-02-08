#!/bin/bash
set -e

echo "--- End-to-end Test: CI/CD Pipeline Deployment ---"

# --- Prerequisites ---
echo "1. Ensure you have configured GitHub Secrets for DOCKER_USERNAME, DOCKER_PASSWORD, and KUBE_CONFIG (or OIDC credentials) in your GitHub repository."
echo "2. Ensure your cloud Kubernetes cluster (AKS, GKE, OKE) is accessible and configured with `kubectl`."
echo "3. Ensure your Dapr components (pubsub.kafka.yaml, state.postgresql.yaml, scheduler.yaml) are configured and ready for deployment."
echo "4. Update image tags in `.github/workflows/deploy.yml` and `k8s/charts/todo-app/values.yaml` to point to your Docker Hub/GHCR repository."
echo ""

# --- Steps ---
echo "1. Make a small, innocuous change to any file in your project (e.g., add a comment to `main.py`)."
echo "   git add ."
echo "   git commit -m "Trigger CI/CD for E2E test""
echo "   git push origin main"
echo ""

echo "2. Monitor the GitHub Actions workflow in your repository (Actions tab)."
echo "   Verify that the 'Deploy to Kubernetes' workflow is triggered and completes successfully."
echo "   Look for green checkmarks next to all steps: Linting, Build/Push Images, Deploy with Helm."
echo ""

echo "3. Once the workflow is complete, check the Kubernetes cluster for deployed resources."
echo "   kubectl get deployments -n default"
echo "   kubectl get pods -n default"
echo "   kubectl get services -n default"
echo ""

echo "4. Identify the public IP or hostname of the Frontend service (LoadBalancer type)."
echo "   kubectl get service todo-app-frontend -n default"
echo "   Look for the 'EXTERNAL-IP' or 'EXTERNAL-NAME' in the output."
echo ""

echo "5. Access the application via the public URL."
echo "   Open a web browser and navigate to the EXTERNAL-IP or hostname."
echo "   Verify that the Todo application is functional and responsive."
echo ""

echo "--- Test Complete ---"
echo "This script provides manual steps to verify the CI/CD pipeline."
