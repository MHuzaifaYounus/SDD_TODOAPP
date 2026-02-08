# CI/CD Pipeline and Deployment Process

This document outlines the Continuous Integration/Continuous Deployment (CI/CD) pipeline for deploying the Todo App to a production Kubernetes cluster.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and automates the process of building, pushing, and deploying the Todo App whenever changes are pushed to the `main` branch.

## Workflow (`.github/workflows/deploy.yml`)

The workflow consists of three main jobs:

1.  **Build**: Builds Docker images for the `todo-app` (frontend/backend) and `todo-worker` components.
2.  **Push**: Authenticates with the Docker registry (e.g., Docker Hub), tags the built images with the commit SHA, and pushes them to the registry.
3.  **Deploy**: Configures `kubectl` with Kubernetes cluster credentials, applies Kubernetes secrets, manifests (deployments, services), and Dapr components to the target Kubernetes cluster. It also includes basic verification steps.

## Kubernetes Resources

-   **`k8s/deployment.yaml`**: Defines the Kubernetes Deployments for `todo-app` and `todo-worker`, including Dapr sidecar injection.
-   **`k8s/service.yaml`**: Defines the Kubernetes Service for the `todo-app` frontend as a `LoadBalancer`, exposing it to the internet.
-   **`k8s/secrets.yaml`**: Defines Kubernetes Secrets for `kafka-secrets` (Redpanda credentials) and `neon-db-secret` (Neon PostgreSQL connection string), referenced by Dapr components.

## Dapr Components (`dapr/components/`)

-   **`pubsub.kafka.yaml`**: Dapr Pub/Sub component for integrating with Redpanda/Kafka.
-   **`state.postgresql.yaml`**: Dapr State Store component for persistent state using Neon PostgreSQL.
-   **`scheduler.yaml`**: Dapr Cron Binding component for scheduled tasks.

## GitHub Secrets

The following GitHub Secrets are required for the CI/CD pipeline to function:

-   `DOCKER_USERNAME`: Username for the container registry (e.g., Docker Hub).
-   `DOCKER_PASSWORD`: Personal Access Token (PAT) or password for the container registry.
-   `KUBECONFIG`: Base64 encoded `kubeconfig` file for accessing the Kubernetes cluster.
-   `REDPANDA_USERNAME`: Username for Redpanda/Kafka.
-   `REDPANDA_PASSWORD`: Password for Redpanda/Kafka.
-   `NEON_DB_URL`: Connection string for the Neon PostgreSQL database.

## Deployment Steps

1.  **Push to `main` branch**: Any commit to the `main` branch will trigger the GitHub Actions workflow.
2.  **Image Build and Push**: Docker images are built and pushed to the configured container registry.
3.  **Deployment to Kubernetes**: The `deploy` job uses `kubectl` to apply all necessary configurations to the Kubernetes cluster.
4.  **Verification**: Basic verification steps are performed to ensure the application is deployed and accessible.

## Troubleshooting

-   **Workflow Failures**: Check the GitHub Actions workflow logs for specific error messages.
-   **Kubernetes Issues**: Use `kubectl logs`, `kubectl describe`, and `kubectl get events` to diagnose problems within the cluster.
-   **Dapr Component Issues**: Check Dapr operator logs and `dapr status` within the cluster.
