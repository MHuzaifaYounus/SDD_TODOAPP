# Research Findings: Phase V - Distributed Cloud Infrastructure

**Feature Branch**: `001-dapr-k8s-cicd`  
**Date**: 2026-02-08  
**Plan**: [specs/001-dapr-k8s-cicd/plan.md](specs/001-dapr-k8s-cicd/plan.md)

## Dapr Component Configuration Best Practices

-   **Decision**: Dapr components (pubsub.kafka, state.postgresql, scheduler) will be defined as separate YAML files and placed in a dedicated `/dapr/components` directory within the Kubernetes deployment. Secrets for connecting to Kafka (Redpanda Cloud) and Neon PostgreSQL will be managed via Kubernetes secrets, referenced in the Dapr component YAMLs.
-   **Rationale**:
    -   Centralizing Dapr component definitions in YAML files promotes reusability, version control, and clear separation of configuration from application code.
    -   Using Kubernetes secrets is the standard and secure practice for handling sensitive information like connection strings and API keys within a Kubernetes cluster.
-   **Alternatives Considered**:
    -   Embedding Dapr component configurations directly into application `deployment.yaml` files: Rejected, as it leads to redundancy and makes component management harder across multiple applications.
    -   Hardcoding secrets or passing them as environment variables directly: Rejected due to severe security risks.

## Dapr with FastAPI Integration Patterns

-   **Decision**: FastAPI applications (Frontend and Background Worker) will interact with Dapr via its HTTP API. For Pub/Sub:
    -   **Publishing**: Applications will make HTTP POST requests to the Dapr sidecar (`http://localhost:3500/v1.0/publish/<pubsub-name>/<topic>`).
    -   **Subscribing**: The Background Worker will expose HTTP endpoints that Dapr will call when new messages arrive on subscribed topics (e.g., `/dapr/subscribe` for subscription registration, and specific routes for message handling).
    -   **State Management**: Applications will use Dapr's state management HTTP API (`http://localhost:3500/v1.0/state/<state-store-name>`) for saving and loading state.
-   **Rationale**:
    -   Dapr's HTTP API offers language independence, allowing both Python (FastAPI) and TypeScript (Frontend) to easily integrate.
    -   It simplifies the application code by offloading complex distributed systems patterns (retries, message guarantees, state consistency) to the Dapr sidecar.
-   **Alternatives Considered**:
    -   Using Dapr Python SDKs: While potentially offering type safety and a more "native" feel, it introduces a direct dependency on a specific SDK version and can be more verbose for simple HTTP interactions. The HTTP API is sufficient for the current requirements.

## Helm Chart Best Practices for Multi-environment Deployment

-   **Decision**: A single, parameterized Helm chart will be developed for the entire application (Frontend, Backend, Worker). Environment-specific configurations (e.g., Dapr component connection strings, image tags, replica counts, ingress hostnames) will be managed using dedicated `values.yaml` files (e.g., `values-minikube.yaml`, `values-cloud.yaml`) that override default values.
-   **Rationale**:
    -   Helm provides a robust templating engine for packaging and deploying Kubernetes applications consistently across environments.
    -   Using separate `values.yaml` files for environments is a standard and flexible approach to manage configuration drift.
-   **Alternatives Considered**:
    -   Kustomize: A viable alternative for configuration management, but Helm charts were explicitly requested and provide more advanced templating capabilities for multi-service deployments.
    -   Multiple Helm charts per environment: Rejected to avoid maintaining duplicate chart definitions.

## GitHub Actions for Kubernetes Deployment

-   **Decision**: The CI/CD pipeline will be implemented using GitHub Actions. It will leverage official GitHub Actions for Docker (e.g., `docker/build-push-action`) and Helm (e.g., `azure/k8s-actions/helm-deploy`). Secure authentication to Docker registries and cloud Kubernetes clusters will be achieved using OpenID Connect (OIDC) for cloud provider access and GitHub Secrets for registry credentials.
-   **Rationale**:
    -   GitHub Actions provides a native, integrated CI/CD solution for GitHub repositories.
    -   Official actions are well-maintained, secure, and simplify common CI/CD tasks.
    -   OIDC offers a keyless and more secure way to authenticate GitHub Actions workflows with cloud providers, minimizing the risk of long-lived credentials.
-   **Alternatives Considered**:
    -   Self-hosted CI/CD runners: Rejected for simplicity and maintenance overhead.
    -   Using custom shell scripts for Docker and Helm commands directly: Rejected for maintainability, security, and potential for errors compared to mature official actions.
