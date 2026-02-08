# Tasks: Phase V - Distributed Cloud Infrastructure

**Input**: Design documents from `/specs/001-dapr-k8s-cicd/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume multi-service structure with `backend/`, `frontend/`, and `services/worker/` as defined in `plan.md`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial project directory and environment setup.

- [x] T001 Create `services/worker` directory.
- [x] T002 Create `dapr/components` directory.
- [x] T003 Create `k8s` directory for Helm charts and Kubernetes manifests.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Dapr components and initial Kubernetes manifest setup, essential before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define `pubsub.kafka.yaml` in `dapr/components/pubsub.kafka.yaml`.
- [x] T005 Define `state.postgresql.yaml` in `dapr/components/state.postgresql.yaml`.
- [x] T006 Define `scheduler.yaml` for Dapr Jobs API support in `dapr/components/scheduler.yaml`.
- [x] T007 Add Kubernetes secret definitions for Kafka and PostgreSQL credentials in `k8s/secrets.yaml`.
- [x] T008 Initialize Helm chart structure in `k8s/charts/todo-app`.
- [x] T009 Update Helm chart `templates/deployment.yaml` to include Dapr sidecar annotations for existing Frontend and Backend services.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Task Management with Dapr Integration (Priority: P1) 🎯 MVP

**Goal**: Enable core task management (create, update) to leverage Dapr for communication and state management.

**Independent Test**: Create/update a task via the frontend. Verify Dapr sidecars are active and an event is published to Kafka.

### Implementation for User Story 1

- [x] T010 [US1] Update `Task` entity model in `src/models/task.py` with `reminderTime`, `isRecurring`, `recurrencePattern`, `lastRecurrenceDate`.
- [x] T011 [US1] Update database schema (via migrations) to include new Task entity fields.
- [x] T012 [P] [US1] Refactor Frontend `frontend/services/dbService.ts` or `frontend/services/geminiService.ts` to publish task creation/update events to Dapr sidecar (HTTP POST to `localhost:3500`).
- [x] T013 [US1] Implement Dapr Jobs API logic to trigger `reminders` based on `Task.reminderTime` (e.g., integrate with existing Backend service or create a Dapr configuration for scheduled events).

**Checkpoint**: User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Automated Reminder and Recurring Task Processing (Priority: P2)

**Goal**: Implement an event-driven background worker to process reminders and manage recurring tasks.

**Independent Test**: Trigger a reminder event and verify mock notification. Trigger a recurring task event and verify a new task is spawned in the DB.

### Implementation for User Story 2

- [x] T014 [US2] Create FastAPI application in `services/worker/main.py`.
- [x] T015 [P] [US2] Create Dockerfile for the worker in `services/worker/Dockerfile`.
- [x] T016 [US2] Implement Dapr subscription endpoint (`/dapr/subscribe`) in `services/worker/main.py` for the `reminders` topic.
- [x] T017 [US2] Implement Dapr subscription endpoint (`/dapr/subscribe`) in `services/worker/main.py` for the `recurring-task` topic.
- [x] T018 [US2] Implement `reminders` event handler in `services/worker/main.py` to log mock notifications.
- [x] T019 [US2] Implement `recurring-task` event handler in `services/worker/main.py` to calculate next due date and spawn new task in DB.
- [x] T020 [US2] Add necessary Python dependencies to `services/worker/pyproject.toml` or `services/worker/requirements.txt`.
- [x] T021 [US2] Configure Dapr subscriptions in `services/worker/main.py` (or as Dapr YAML subscriptions).

**Checkpoint**: User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Automated Cloud Deployment (Priority: P3)

**Goal**: Establish an automated CI/CD pipeline for building, deploying, and exposing the application in a cloud Kubernetes cluster.

**Independent Test**: Push code to `main` branch, verify GitHub Actions success, and access the deployed app via a public cloud URL.

### Implementation for User Story 3

- [x] T022 [P] [US3] Create GitHub Actions workflow file at `.github/workflows/deploy.yml`.
- [x] T023 [P] [US3] Add Linting step to `.github/workflows/deploy.yml`.
- [x] T024 [P] [US3] Add Build Docker Image step for Frontend (`frontend/Dockerfile`) to `.github/workflows/deploy.yml`.
- [x] T025 [P] [US3] Add Build Docker Image step for Backend (`backend/Dockerfile`) to `.github/workflows/deploy.yml`.
- [x] T026 [P] [US3] Add Build Docker Image step for Worker (`services/worker/Dockerfile`) to `.github/workflows/deploy.yml`.
- [x] T027 [P] [US3] Add Push to Registry step (Docker Hub/GHCR) for all images to `.github/workflows/deploy.yml`.
- [x] T028 [US3] Refine Helm chart (`k8s/charts/todo-app/`) to deploy all services (Frontend, Backend, Worker) with Dapr sidecars and configure `LoadBalancer` for cloud.
- [x] T029 [US3] Add Deploy to Cloud K8s via Helm step to `.github/workflows/deploy.yml`.
- [x] T030 [US3] Add OIDC configuration for secure cloud access to `.github/workflows/deploy.yml`.
- [x] T031 [P] [US3] Update `quickstart.md` with guidance for connecting `kubectl` to Azure AKS, GKE, or OKE.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and testing across the entire feature.

- [x] T032 [P] Document Dapr component YAMLs in `dapr/components/` with detailed comments.
- [x] T033 [P] Review and refine Helm charts for robust multi-environment support (e.g., `values-minikube.yaml`, `values-cloud.yaml`).
- [x] T034 [P] Implement comprehensive structured logging for the Background Worker in `services/worker/main.py`.
- [x] T035 End-to-end testing of Dapr Pub/Sub for reminders (simulating task creation/update and worker processing).
- [x] T036 End-to-end testing of recurring task spawning logic via Dapr Jobs API and worker processing.
- [x] T037 End-to-end testing of the CI/CD pipeline deployment to a test environment, verifying public URL accessibility.

---

## Dependencies & Execution Order

### Phase Dependencies

-   **Setup (Phase 1)**: No dependencies - can start immediately.
-   **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
-   **User Stories (Phase 3+)**: All depend on Foundational phase completion.
    -   User stories can then proceed in parallel (if staffed).
    -   Or sequentially in priority order (P1 → P2 → P3).
-   **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

-   **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
-   **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with Dapr Pub/Sub set up in US1.
-   **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Deploys components from US1 and US2.

### Within Each User Story

-   Models/Schema updates before services that use them.
-   Services before API endpoints that consume them.
-   Core implementation before integration.
-   Story complete before moving to next priority.

### Parallel Opportunities

-   All tasks marked [P] can run in parallel (different files, no immediate dependencies on other tasks in that group).
-   Once the Foundational phase completes, different user stories can be worked on in parallel by different team members.

---

## Parallel Example: User Story 1

```bash
# Example for T012 & T013
# Update Frontend dbService and implement Dapr Jobs API
# These tasks are largely independent and can be worked on in parallel.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Phase 1: Setup
2.  Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3.  Complete Phase 3: User Story 1
4.  **STOP and VALIDATE**: Test User Story 1 independently.
5.  Deploy/demo if ready.

### Incremental Delivery

1.  Complete Setup + Foundational → Foundation ready.
2.  Add User Story 1 → Test independently → Deploy/Demo (MVP!).
3.  Add User Story 2 → Test independently → Deploy/Demo.
4.  Add User Story 3 → Test independently → Deploy/Demo.
5.  Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1.  Team completes Setup + Foundational together.
2.  Once Foundational is done:
    -   Developer A: User Story 1
    -   Developer B: User Story 2
    -   Developer C: User Story 3
3.  Stories complete and integrate independently.

---

## Notes

-   [P] tasks = different files, no dependencies.
-   [Story] label maps task to specific user story for traceability.
-   Each user story should be independently completable and testable.
-   Verify tests fail before implementing.
-   Commit after each task or logical group.
-   Stop at any checkpoint to validate story independently.
-   Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence.
