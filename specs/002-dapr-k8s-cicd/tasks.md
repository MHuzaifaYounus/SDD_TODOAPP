# Tasks for Production Cloud Deployment & CI/CD

**Feature Name**: Production Cloud Deployment & CI/CD
**Feature Branch**: `002-dapr-k8s-cicd`
**Created**: 2026-02-08
**Status**: Draft

## Implementation Strategy

The implementation will follow an iterative approach, focusing on getting the core CI/CD pipeline and cloud deployment operational as quickly as possible (MVP). Subsequent tasks will refine and enhance the process. Each user story will be developed to be independently testable.

## Phase 1: Setup

This phase focuses on the initial environment and repository setup required before beginning cloud provisioning and CI/CD implementation.

- [x] T001 Review and select cloud provider (Azure AKS or Oracle OKE) for Kubernetes cluster based on research findings. (Research Task 1 in `specs/002-dapr-k8s-cicd/plan.md`)
- [x] T002 Install necessary cloud provider CLI (Azure CLI or OCI CLI) on the CI/CD runner or local machine.
- [x] T003 Install `kubectl` on the CI/CD runner or local machine.
- [x] T004 Install Dapr CLI on the CI/CD runner or local machine.
- [x] T005 Create a `.github/workflows` directory if it doesn't exist.

## Phase 2: Foundational Tasks (Cloud Infrastructure & Dapr Setup)

This phase establishes the core cloud infrastructure and Dapr environment, which are prerequisites for deploying the application.

- [x] T006 Provision the selected Kubernetes cluster (AKS or OKE) in the chosen cloud provider. (Reference: Cloud Provider Console/CLI documentation)
- [x] T007 Configure `kubeconfig` for access to the newly provisioned Kubernetes cluster on the CI/CD runner and local development environment.
- [x] T008 Install the Dapr Control Plane on the Kubernetes cluster using `dapr init -k`.
- [x] T009 Configure LoadBalancer Service for the frontend application in `k8s/service.yaml`.
- [x] T010 Create necessary GitHub Secrets for `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `KUBECONFIG` (base64 encoded), `REDPANDA_USERNAME`, `REDPANDA_PASSWORD`, `NEON_DB_URL` in the GitHub repository settings. (Reference: GitHub documentation on creating secrets)

## Phase 3: User Story 1 - Automated Deployment to Production [US1]

**Story Goal**: Implement a CI/CD pipeline that automatically builds, pushes, and deploys the Todo App to the cloud Kubernetes cluster on every push to the `main` branch.
**Independent Test**: Pushing changes to the `main` branch triggers a GitHub Actions workflow, which successfully builds Docker images for `todo-app` and `todo-worker`, pushes them to a container registry, and deploys the application to the cloud Kubernetes cluster. The deployed application should then be accessible via a public IP, and all its functionalities, including the AI Chatbot, must be operational.

- [x] T011 [US1] Create `.github/workflows/deploy.yml` file to define the CI/CD pipeline structure.
- [x] T012 [US1] Define `on: push: branches: [main]` trigger in `.github/workflows/deploy.yml`.
- [x] T013 [US1] Add `build` job to `.github/workflows/deploy.yml` to build Docker images for `todo-app` (frontend/backend) and `todo-worker`.
- [x] T014 [US1] Add `push` job to `.github/workflows/deploy.yml` to tag and push built Docker images to the configured container registry, utilizing GitHub Secrets for authentication.
- [x] T015 [US1] Add `deploy` job to `.github/workflows/deploy.yml` to configure `kubectl` with the cluster credentials from GitHub Secrets and apply Kubernetes manifests.
- [x] T016 [US1] Ensure `k8s/deployment.yaml` correctly references the Docker images from the container registry and includes Dapr sidecar annotations.
- [x] T017 [US1] Ensure `k8s/service.yaml` correctly defines the LoadBalancer Service for the `todo-app` frontend.
- [x] T018 [US1] Create/Update Dapr component YAMLs (e.g., `dapr/components/pubsub.kafka.yaml`, `dapr/components/state.postgresql.yaml`, `dapr/components/scheduler.yaml`) to use appropriate secrets and configurations from the plan.
- [x] T019 [US1] Update `deploy` job in `.github/workflows/deploy.yml` to apply the Dapr component YAMLs to the cluster.
- [x] T020 [US1] Implement verification steps within the `deploy` job (or as a separate job) to ensure successful deployment, service accessibility, and Dapr component health checks.

## Final Phase: Polish & Cross-Cutting Concerns

This phase addresses overall quality, documentation, and operational aspects.

- [x] T021 Review and refine `.github/workflows/deploy.yml` for comprehensive error handling, logging, and performance optimization.
- [x] T022 Document the CI/CD pipeline, deployment process, and essential operational steps in `docs/deployment.md`.
- [x] T023 Implement robust monitoring and alerting for the deployed application and Dapr components on the Kubernetes cluster.

## Dependencies

The phases are largely sequential:
Phase 1 (Setup) -> Phase 2 (Foundational Tasks) -> Phase 3 (User Story 1 - Automated Deployment to Production) -> Final Phase (Polish & Cross-Cutting Concerns).

Within Phase 2, tasks like T006 (Provision cluster) and T007 (Configure kubeconfig) are sequential. T008 (Install Dapr) depends on T006 and T007. T009 (Configure LoadBalancer) and T010 (GitHub Secrets) can be performed in parallel with some other tasks in Phase 2 but are prerequisites for Phase 3.

Within Phase 3, tasks T011-T015 (CI/CD YAML definition) can largely be developed in parallel with T016-T018 (Kubernetes/Dapr manifest refinement), given clear contract definitions. T019 (Applying Dapr components) depends on T018. T020 (Verification) depends on the successful completion of the deployment.

## Parallel Execution Examples

-   **Cloud CLI & Tools Setup (Phase 1)**: T002 (Azure CLI/OCI CLI), T003 (kubectl), T004 (Dapr CLI) can be installed in parallel after the cloud provider decision (T001).
-   **GitHub Secrets Configuration & Manifest Refinement (Phase 2 & 3)**: While T006-T008 are being executed for cluster provisioning and Dapr installation, T010 (GitHub Secrets setup), T009 (k8s/service.yaml), T016 (k8s/deployment.yaml), T018 (Dapr components) can be worked on concurrently by different team members or as independent preparatory steps.
-   **CI/CD Job Definition (Phase 3)**: Once the overall `.github/workflows/deploy.yml` structure is in place (T011, T012), defining the `build` (T013), `push` (T014), and `deploy` (T015) jobs can proceed with some level of concurrency, assuming job interdependencies are managed.

## Summary

-   **Total task count**: 23
-   **Task count per user story**:
    -   User Story 1: 10 tasks
    -   Setup: 5 tasks
    -   Foundational Tasks: 5 tasks
    -   Polish & Cross-Cutting Concerns: 3 tasks
-   **Parallel opportunities identified**: Yes, particularly within the setup phase and in parallel preparation of CI/CD definitions and Kubernetes/Dapr manifests.
-   **Independent test criteria for each story**: Clearly defined for User Story 1, focusing on automated deployment to a public URL with full functionality.
-   **Suggested MVP scope**: User Story 1 - Automated Deployment to Production, encompassing all foundational tasks required to achieve this automated deployment.
-   **Format validation**: All tasks adhere to the checklist format `- [ ] [TaskID] [P?] [Story?] Description with file path`.