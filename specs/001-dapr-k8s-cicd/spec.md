# Feature Specification: Phase V - Distributed Cloud Infrastructure

**Feature Branch**: `001-dapr-k8s-cicd`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Feature: Phase V - Distributed Cloud Infrastructure Context: The Todo App has complete functional features. We now need to wrap it in a professional distributed system architecture using Dapr and Kafka for deployment to a production Cloud Kubernetes cluster. Requirements: 1. **Dapr Runtime Integration:** - Define Dapr Component YAMLs for: - **Pub/Sub:** Using Kafka (Redpanda Cloud) for the `task-events` and `reminders` topics. - **State Store:** Using Neon PostgreSQL to persist conversation and session state via Dapr. - **Jobs API:** To trigger the `reminders` logic at specific timestamps based on task due dates. - Update Kubernetes manifests to include Dapr sidecar annotations (`dapr.io/enabled: "true"`). 2. **Event-Driven Service Logic:** - Create a lightweight **Background Worker** (Python/FastAPI) to act as an event consumer. - Logic: When the `reminders` topic receives an event from the Frontend/Dapr, this worker sends a mock notification (logs to console/service) to simulate a push notification. - Logic: When a `recurring-task` event is received, this worker calculates the next due date and calls the Database to spawn the new task. 3. **Cloud Kubernetes (Azure/Oracle/GKE):** - Prepare Helm charts for multi-environment deployment (Local vs. Cloud). - Ensure the `LoadBalancer` service is configured for the chosen cloud provider to get a public IP. 4. **CI/CD & DevOps:** - Create a **GitHub Actions Workflow** (`.github/workflows/deploy.yml`): - Trigger: Push to `main` branch. - Steps: Lint, Build Docker Image, Push to Registry (Docker Hub/GHCR), and Deploy to Cloud K8s via Helm. Acceptance Criteria: - Dapr sidecars are successfully running alongside the Frontend and Worker pods. - Creating a task with a reminder successfully publishes an event to Kafka. - The Background Worker successfully processes events from the Kafka queue. - The app is accessible via a public cloud URL. - CI/CD pipeline successfully automates the build and deploy process."

## User Scenarios & Testing

### User Story 1 - Task Management with Dapr Integration (Priority: P1)

As a user, I want to create and manage tasks with reminders, and have these actions reliably processed by the system using Dapr for communication and state management.

**Why this priority**: This story covers the core Dapr integration for core application functionality (task creation and reminders) which is fundamental to the distributed architecture.

**Independent Test**: This can be fully tested by creating a task with a reminder through the frontend, observing that the Dapr sidecars are active, and verifying that reminder events are published to the message broker.

**Acceptance Scenarios**:

1.  **Given** the Todo application is deployed with Dapr sidecars enabled, **When** I create a new task with a due date and reminder, **Then** the task is persisted, and a reminder event is published to the configured message broker (Kafka).
2.  **Given** the Todo application is deployed with Dapr sidecars enabled, **When** I update an existing task, **Then** the task's state is updated via Dapr's state store.

### User Story 2 - Automated Reminder and Recurring Task Processing (Priority: P2)

As a user, I want the system to automatically handle reminders for my tasks and generate new tasks for recurring events, ensuring I receive timely notifications and my recurring schedule is maintained.

**Why this priority**: This story implements the event-driven background logic that provides critical user value by automating notifications and recurring task management, leveraging the distributed messaging system.

**Independent Test**: This can be tested by triggering reminder and recurring task events (either manually or via simulated Dapr Jobs API calls) and verifying that the Background Worker processes them correctly, logging mock notifications and spawning new tasks in the database.

**Acceptance Scenarios**:

1.  **Given** a reminder event is received by the Background Worker, **When** the worker processes the event, **Then** a mock notification is logged (simulating a push notification).
2.  **Given** a recurring task event is received by the Background Worker, **When** the worker processes the event, **Then** the next due date for the recurring task is calculated, and a new task is spawned in the database.

### User Story 3 - Automated Cloud Deployment (Priority: P3)

As a developer, I want an automated CI/CD pipeline that builds, tests, and deploys the Todo application to a cloud Kubernetes cluster upon code pushes, streamlining the release process and ensuring consistent deployments.

**Why this priority**: This story enables efficient and reliable deployment to production environments, which is crucial for maintaining and evolving the distributed system.

**Independent Test**: This can be tested by pushing code to the `main` branch and verifying that the GitHub Actions workflow successfully builds Docker images, pushes them to a registry, and deploys the application to the configured cloud Kubernetes cluster, making it accessible via a public URL.

**Acceptance Scenarios**:

1.  **Given** code is pushed to the `main` branch of the repository, **When** the GitHub Actions workflow is triggered, **Then** the workflow successfully lints, builds Docker images for both frontend and backend services, pushes them to a container registry, and deploys the application to the cloud Kubernetes cluster.
2.  **Given** the application is deployed via the CI/CD pipeline to a cloud Kubernetes cluster, **When** I access the configured public URL, **Then** the Todo application is fully functional and responsive.

### Edge Cases

-   What happens if the Kafka broker is unavailable when Dapr attempts to publish an event? (Dapr's retry mechanisms should be considered)
-   How does the system handle network partitioning between Dapr sidecars and application services?
-   What if the Neon PostgreSQL state store is unreachable during a Dapr state operation?
-   What if a reminder event is processed multiple times by the Background Worker due to message broker retries? (Idempotency)
-   How does the CI/CD pipeline handle deployment failures (e.g., Kubernetes cluster issues, image pull errors)?

## Requirements

### Functional Requirements

-   **FR-001**: The system MUST integrate Dapr for application-level pub/sub messaging using Kafka.
-   **FR-002**: The system MUST define Dapr Component YAMLs for Kafka pub/sub, specifically for `task-events` and `reminders` topics.
-   **FR-003**: The system MUST integrate Dapr for state management using Neon PostgreSQL.
-   **FR-004**: The system MUST update Kubernetes manifests to include Dapr sidecar annotations (`dapr.io/enabled: "true"`) for relevant pods (Frontend, Backend, Worker).
-   **FR-005**: The system MUST include a Background Worker service capable of consuming events from the `reminders` topic.
-   **FR-006**: The Background Worker MUST log a mock notification to simulate push notifications upon receiving a `reminders` event.
-   **FR-007**: The Background Worker MUST consume events from a `recurring-task` topic.
-   **FR-008**: Upon receiving a `recurring-task` event, the Background Worker MUST calculate the next due date and spawn a new task in the database.
-   **FR-009**: The system MUST provide Helm charts for multi-environment deployment (local and cloud Kubernetes).
-   **FR-010**: The Kubernetes deployment MUST expose the application via a `LoadBalancer` service configured for a cloud provider.
-   **FR-011**: The system MUST include a GitHub Actions workflow (`.github/workflows/deploy.yml`) triggered by pushes to the `main` branch.
-   **FR-012**: The GitHub Actions workflow MUST include steps for linting, building Docker images, pushing images to a container registry, and deploying to cloud Kubernetes via Helm.
-   **FR-013**: The system MUST utilize Dapr's Jobs API to trigger the `reminders` logic at specific timestamps based on task due dates.

### Key Entities

-   **Task**: Existing entity, now has an associated reminder due date which can trigger Dapr Jobs and events.
-   **ReminderEvent**: Logical entity representing a notification for a task, published to Kafka.
-   **RecurringTaskEvent**: Logical entity representing a trigger for generating a new recurring task, published to Kafka.
-   **Dapr State Store**: Stores conversation and session state using Neon PostgreSQL.

## Success Criteria

### Measurable Outcomes

-   **SC-001**: Dapr sidecars for all application services (Frontend, Backend, Worker) are successfully deployed and operational in the Kubernetes cluster, verifiable by Dapr health checks.
-   **SC-002**: Creating a task with a reminder via the Frontend successfully publishes an event to the Kafka `reminders` topic within 5 seconds.
-   **SC-003**: The Background Worker successfully processes 100% of reminder events from the Kafka queue within 10 seconds of publication, logging a mock notification for each.
-   **SC-004**: The Background Worker successfully processes 100% of recurring task events from the Kafka queue, calculating the next due date and spawning a new task in the database within 15 seconds of publication.
-   **SC-005**: The deployed application is accessible via a public cloud URL with a response time for the main landing page under 2 seconds.
-   **SC-006**: The CI/CD pipeline (GitHub Actions workflow) completes all build and deployment steps successfully within 10 minutes for a typical code push to `main`.
-   **SC-007**: All Dapr state store operations (read/write) complete within 200ms 95% of the time.

## Assumptions

-   A Kafka (Redpanda Cloud) instance will be available and configured for Dapr pub/sub.
-   A Neon PostgreSQL instance will be available and configured for Dapr state store.
-   The Kubernetes cluster (Azure/Oracle/GKE) is pre-provisioned and accessible for Helm deployments.
-   A container registry (Docker Hub/GHCR) is configured and accessible for pushing Docker images.
-   Existing Todo app services (Frontend, Backend) are capable of being containerized and are Dapr-agnostic at their core business logic level.
-   The "mock notification" logging is sufficient for the MVP of the Background Worker's notification logic.
-   The current task data model can accommodate fields necessary for reminders and recurring task logic (e.g., due date, recurrence pattern).