# Implementation Plan: Production Cloud Deployment & CI/CD

**Feature Branch**: `002-dapr-k8s-cicd`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Feature: Phase V Part C - Production Cloud Deployment & CI/CD Context: Deploy the Todo App to a production-grade Cloud Kubernetes cluster and automate the process using GitHub Actions. Requirements: 1. **Infrastructure (Cloud K8s):** - Provision a Kubernetes cluster on Azure (AKS) or Oracle (OKE). - Install the **Dapr Control Plane** on the cloud cluster (`dapr init -k`). - Configure a **LoadBalancer Service** for the frontend to get a real Public IP. 2. **CI/CD Pipeline (GitHub Actions):** - Create a workflow file `.github/workflows/deploy.yml`. - **Trigger:** On every push to the `main` branch. - **Jobs:** - **Build:** Build Docker images for both `todo-app` and `todo-worker`. - **Push:** Tag and push images to **Docker Hub** or **GitHub Container Registry`. - **Deploy:** Point `kubectl` to the cloud cluster and apply all K8s manifests and Dapr components. 3. **Secrets Management:** - Use GitHub Actions Secrets for sensitive data: - `DOCKER_USERNAME` / `DOCKER_PASSWORD` - `KUBECONFIG` (The cloud cluster credentials) - `REDPANDA_USERNAME` / `REDPANDA_PASSWORD` - `NEON_DB_URL` Acceptance Criteria: - The application is accessible via a public IP/DNS (e.g., http://20.xxx.xxx.xxx). - Pushing code to GitHub automatically updates the live website. - The AI Chatbot works on the public URL using the hardcoded/secret keys."

## Technical Context

The objective is to deploy the existing Todo App to a production-grade Cloud Kubernetes cluster, specifically on Azure (AKS) or Oracle (OKE), and establish an automated Continuous Integration/Continuous Deployment (CI/CD) pipeline using GitHub Actions. The deployment will leverage Dapr for distributed application runtime capabilities, requiring the installation of the Dapr Control Plane on the cluster. The frontend application needs to be exposed publicly via a Kubernetes LoadBalancer Service. All sensitive configuration data, such as container registry credentials, Kubernetes cluster access, Redpanda credentials, and database connection strings, will be securely managed through GitHub Actions Secrets. The CI/CD pipeline will be triggered on pushes to the `main` branch, encompassing Docker image builds, pushes to a container registry, and the application of Kubernetes manifests and Dapr components to the cloud cluster.

## Constitution Check

The project's `constitution.md` is currently a template. Therefore, a formal check against defined principles is not possible at this stage. However, this plan is designed to adhere to general principles of maintainability, security, automation, and best practices for cloud-native deployments. The implementation will prioritize secure secret management, idempotent deployments, and clarity in the CI/CD workflow.

## Phase 0: Outline & Research

The following research tasks are identified to address unknowns and ensure a robust implementation plan.

### Research Task 1: Cloud Provider Selection and Provisioning Details

-   **Unknown**: Detailed steps, specific configurations, and nuances for provisioning a production-ready Kubernetes cluster on either Azure Kubernetes Service (AKS) or Oracle Container Engine for Kubernetes (OKE). This includes considerations for networking (VNet/VCN integration), node pool sizing, auto-scaling capabilities, and securing access via RBAC and network policies.
-   **Research Focus**:
    -   Compare the provisioning workflows and management overhead of AKS vs. OKE.
    -   Identify best practices for production cluster setup (e.g., dedicated subnets, private endpoints, managed identity).
    -   Determine the specific `az aks create` or `oci ce cluster create` commands and parameters.
    -   Assess the cost implications and regional availability for each service.

### Research Task 2: Dapr Control Plane Installation and Production Configuration

-   **Unknown**: Optimal and secure methods for installing the Dapr Control Plane on a newly provisioned cloud Kubernetes cluster, considering high availability, resource allocation, and integration with cloud-specific services.
-   **Research Focus**:
    -   Investigate `dapr init -k` command options for production deployments.
    -   Identify recommended resource requests/limits for Dapr system components.
    -   Review Dapr's documentation on high availability and resilience in Kubernetes.
    -   Understand any specific cloud provider integrations or prerequisites for Dapr.

### Research Task 3: Container Registry Best Practices for CI/CD

-   **Unknown**: The choice between Docker Hub and GitHub Container Registry for storing application images, and the most effective way to authenticate and manage image lifecycle within GitHub Actions.
-   **Research Focus**:
    -   Compare features, pricing, security models, and integration capabilities of Docker Hub and GitHub Container Registry.
    -   Determine the most secure method for GitHub Actions to authenticate with the chosen registry (e.g., personal access tokens, GitHub Token for GHCR).
    -   Define image tagging strategies (e.g., `latest`, Git SHA, semantic versioning) and image retention policies.

### Research Task 4: Kubernetes Manifest Management and Dapr Component Deployment

-   **Unknown**: The best approach to organize and manage Kubernetes deployment manifests and Dapr component YAMLs within the repository, and a robust, idempotent strategy for applying these configurations via `kubectl` within the GitHub Actions pipeline.
-   **Research Focus**:
    -   Evaluate approaches like raw YAMLs (with kustomize if needed) vs. Helm charts for managing Kubernetes resources.
    -   Determine the `kubectl` commands necessary for applying configurations safely and ensuring idempotency in a CI/CD context (e.g., `kubectl apply -f`, `kubectl diff`, `kubectl rollout status`).
    -   Consider GitOps principles for managing infrastructure as code.

### Research Task 5: GitHub Actions Secrets for Production Workloads

-   **Unknown**: Best practices for managing sensitive environment variables in GitHub Actions for production deployments, including secure storage, access control, and mechanisms for rotation.
-   **Research Focus**:
    -   Review GitHub's documentation on repository and organization secrets.
    -   Explore concepts like environment protection rules and required reviewers for production deployments.
    -   Investigate methods for dynamic secret injection or rotation if native GitHub Actions features are insufficient.

## Phase 1: Design & Contracts

This phase focuses on defining the architectural components and their interfaces, informed by the research outcomes.

### Data Model (Infrastructure/CI/CD Configuration)

-   **Kubernetes Cluster Configuration**:
    -   `provider`: String (e.g., "AKS", "OKE")
    -   `region`: String (e.g., "eastus", "us-phoenix-1")
    -   `name`: String (Cluster name)
    -   `node_count`: Integer (Number of worker nodes)
    -   `node_vm_size`: String (VM size for worker nodes, e.g., "Standard_DS2_v2")
    -   `kubernetes_version`: String (e.g., "1.28.5")
    -   `network_configuration`: Object (VNet/VCN details, subnet IDs, CIDR ranges)
    -   `rbac_config`: Boolean (Enable/Disable RBAC)

-   **Dapr Control Plane Configuration**:
    -   `version`: String (Dapr CLI version for installation)
    -   `high_availability`: Boolean
    -   `resource_limits`: Object (CPU, Memory limits for Dapr components)

-   **Container Image Metadata**:
    -   `app_image_name`: String (e.g., "todo-app")
    -   `worker_image_name`: String (e.g., "todo-worker")
    -   `registry_url`: String (e.g., "docker.io/yourusername", "ghcr.io/yourorg")
    -   `tagging_strategy`: String (e.g., "git-sha", "semver", "latest")

-   **GitHub Actions Workflow Variables**:
    -   `env_variables`: Map (Non-sensitive workflow-specific environment variables)
    -   `secret_names`: Array of Strings (References to GitHub Secrets)

### Contracts (CI/CD Pipeline Structure)

-   **GitHub Actions Workflow File (`.github/workflows/deploy.yml`)**:
    -   **Trigger**:
        ```yaml
        on:
          push:
            branches:
              - main
        ```
    -   **Jobs**:
        -   `build`:
            -   Steps: `checkout`, `setup-docker`, `build-todo-app-image`, `build-todo-worker-image`
        -   `push`:
            -   Depends on: `build`
            -   Steps: `login-to-registry`, `tag-and-push-app-image`, `tag-and-push-worker-image`
        -   `deploy`:
            -   Depends on: `push`
            -   Steps: `checkout`, `configure-kubeconfig`, `install-dapr-cli`, `dapr-init-k`, `apply-k8s-manifests`, `apply-dapr-components`, `verify-deployment`

-   **Kubernetes Manifests (Located in `k8s/` directory)**:
    -   `k8s/deployment.yaml`: Defines `todo-app` and `todo-worker` deployments with Dapr sidecar injection.
    -   `k8s/service.yaml`: Defines Kubernetes Services for `todo-app` (type: LoadBalancer) and `todo-worker`.
    -   `k8s/dapr-config/`: Directory for Dapr component YAMLs.
        -   `pubsub.kafka.yaml`: Dapr Pub/Sub component for Redpanda/Kafka.
        -   `state.postgresql.yaml`: Dapr State Store component for Neon PostgreSQL.
        -   `scheduler.yaml`: Dapr Actor runtime component (if actors are used).

-   **GitHub Secrets Naming Convention**:
    -   `DOCKER_USERNAME`: Username for container registry.
    -   `DOCKER_PASSWORD`: Password/PAT for container registry.
    -   `KUBECONFIG`: Base64 encoded Kubernetes cluster configuration file.
    -   `REDPANDA_USERNAME`: Username for Redpanda/Kafka.
    -   `REDPANDA_PASSWORD`: Password for Redpanda/Kafka.
    -   `NEON_DB_URL`: Connection string for Neon PostgreSQL database.

### Quickstart.md

A high-level guide to setting up the CI/CD pipeline:

1.  **Cloud Kubernetes Cluster Provisioning**: Manually provision an AKS or OKE cluster using cloud provider CLI/Console. Obtain the `kubeconfig` file.
2.  **Dapr Control Plane Installation**: Once the cluster is active, install Dapr Control Plane using `dapr init -k`.
3.  **GitHub Secrets Configuration**: In the GitHub repository settings, create the necessary secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`, `KUBECONFIG` (base64 encoded), `REDPANDA_USERNAME`, `REDPANDA_PASSWORD`, `NEON_DB_URL`).
4.  **Repository Setup**: Ensure `k8s/` and `dapr/components/` directories exist with respective Kubernetes manifests and Dapr component YAMLs.
5.  **Trigger CI/CD**: Push code to the `main` branch to automatically trigger the GitHub Actions workflow for build, push, and deploy.