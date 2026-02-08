# Tasks: Serverless Frontend Deployment

**Input**: Design documents from `/specs/001-serverless-frontend-deploy/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification. For this feature, integration testing will primarily involve verifying the deployment and application accessibility.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create `k8s/` directory at project root for Kubernetes manifests `/k8s/`
- [X] T002 Create `deploy.sh` script at project root `/deploy.sh`
- [X] T003 Create `Dockerfile` in `frontend/` directory `/frontend/Dockerfile`
- [X] T004 Create `nginx.conf` in `frontend/` directory `/frontend/nginx.conf`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Populate `Dockerfile` with multi-stage build for React/Vite app in `/frontend/Dockerfile`
- [X] T006 Configure `Dockerfile` to accept `VITE_GEMINI_API_KEY` and `VITE_DB_URL` as build arguments in `/frontend/Dockerfile`
- [X] T007 Configure `Dockerfile` to copy `dist` from builder to Nginx runner stage in `/frontend/Dockerfile`
- [X] T008 Populate `nginx.conf` with React Router fallback configuration in `/frontend/nginx.conf`
- [X] T009 Create Kubernetes Deployment manifest for `todo-app` with 1 replica in `/k8s/deployment.yaml`
- [X] T010 Create Kubernetes Service manifest (NodePort) to expose port 80 for `todo-app` in `/k8s/service.yaml`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Deploy React App to Minikube (Priority: P1) 🎯 MVP

**Goal**: Successfully deploy the React+Vite frontend application to a local Minikube Kubernetes cluster using an automated script, making it accessible and functional.

**Independent Test**: Execute the `deploy.sh` script and verify the React app is accessible via the NodePort URL in Minikube, and that client-side routing works as expected for direct URL access and page refreshes.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US1] Integration test: Verify successful deployment and accessibility via NodePort URL.
- [X] T012 [P] [US1] Integration test: Verify client-side routing by accessing a deep link and refreshing the page.

### Implementation for User Story 1

- [X] T013 [US1] Implement `deploy.sh` script to set Minikube Docker environment `/deploy.sh`
- [X] T014 [US1] Implement `deploy.sh` script to build Docker image passing local `.env` variables as build args `/deploy.sh`
- [X] T015 [US1] Implement `deploy.sh` script to apply Kubernetes manifests (`deployment.yaml`, `service.yaml`) `/deploy.sh`
- [X] T016 [US1] Implement `deploy.sh` script to open the deployed application's service URL in a browser `/deploy.sh`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T017 Review all created files for best practices, naming conventions, and comments (`Dockerfile`, `nginx.conf`, `k8s manifests`, `deploy.sh`)
- [X] T018 Code cleanup and refactoring
- [X] T019 Add comprehensive README/documentation for the deployment process to project root `/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks can run in parallel
- All Foundational tasks can run in parallel
- Once Foundational phase completes, User Story 1 tasks can be implemented.

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Integration test: Verify successful deployment and accessibility via NodePort URL."
Task: "Integration test: Verify client-side routing by accessing a deep link and refreshing the page."

# Launch all implementation tasks for User Story 1 together:
Task: "Implement deploy.sh script to set Minikube Docker environment /deploy.sh"
Task: "Implement deploy.sh script to build Docker image passing local .env variables as build args /deploy.sh"
Task: "Implement deploy.sh script to apply Kubernetes manifests (deployment.yaml, service.yaml) /deploy.sh"
Task: "Implement deploy.sh script to open the deployed application's service URL in a browser /deploy.sh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
