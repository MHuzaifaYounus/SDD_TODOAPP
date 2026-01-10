---
description: "Task list for Console Todo App implementation"
---

# Tasks: Console Todo App

**Input**: Design documents from `/specs/001-console-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize Python 3.13+ project with uv dependency management
- [x] T003 [P] Create directory structure: src/{models,services,cli,lib} and tests/{unit,integration,contract}

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create Task class in src/models/task.py with id, title, description, status attributes
- [x] T005 [P] Create TaskService in src/services/task_service.py with in-memory storage
- [x] T006 [P] Create utils module in src/lib/utils.py for input validation and formatting
- [x] T007 Create base error handling for invalid inputs in src/lib/utils.py
- [x] T008 Configure graceful error handling without crashing as specified

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Main Menu Navigation (Priority: P1) 🎯 MVP

**Goal**: User can start the application and see a menu with options to Add, List, Update, Delete, Complete, and Exit. The user can select an option by entering the corresponding number or command.

**Independent Test**: The application can be started and the user can navigate through the main menu options. The menu displays clearly and accepts user input without crashing.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Contract test for main menu functionality in tests/contract/test_main_menu.py
- [ ] T010 [P] [US1] Integration test for menu navigation in tests/integration/test_menu_flow.py

### Implementation for User Story 1

- [x] T011 [US1] Implement main application loop in src/cli/main.py
- [x] T012 [US1] Create menu display function in src/cli/main.py
- [x] T013 [US1] Implement menu selection handler in src/cli/main.py
- [x] T014 [US1] Add graceful error handling for invalid menu selections
- [x] T015 [US1] Implement exit functionality in src/cli/main.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Add New Task (Priority: P1)

**Goal**: User can add a new task with a required Title and optional Description. The system validates that the title is provided before creating the task.

**Independent Test**: A user can successfully add a task with just a title, or with both title and description. The task appears in the task list with a unique ID and "pending" status.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US2] Contract test for add task functionality in tests/contract/test_add_task.py
- [ ] T017 [P] [US2] Integration test for add task workflow in tests/integration/test_add_flow.py

### Implementation for User Story 2

- [x] T018 [US2] Add create_task method to TaskService in src/services/task_service.py
- [x] T019 [US2] Implement title validation in src/services/task_service.py
- [x] T020 [US2] Add unique ID generation in src/services/task_service.py
- [x] T021 [US2] Create add task handler in src/cli/main.py
- [x] T022 [US2] Add input validation for required title in src/lib/utils.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View All Tasks (Priority: P1)

**Goal**: User can view all tasks displaying their ID, Title, Status, and Description. Completed tasks are visually distinguished from pending tasks using text formatting.

**Independent Test**: A user can view all tasks with clear visual distinction between completed ([x]) and pending ([ ]) tasks, showing ID, Title, Status, and Description.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T023 [P] [US3] Contract test for list tasks functionality in tests/contract/test_list_tasks.py
- [ ] T024 [P] [US3] Integration test for view tasks workflow in tests/integration/test_view_flow.py

### Implementation for User Story 3

- [x] T025 [US3] Add get_all_tasks method to TaskService in src/services/task_service.py
- [x] T026 [US3] Create task display formatter in src/lib/utils.py for [x]/[ ] formatting
- [x] T027 [US3] Implement list tasks handler in src/cli/main.py
- [x] T028 [US3] Add proper task display with ID, Title, Status, and Description in src/cli/main.py

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Toggle Task Status (Priority: P2)

**Goal**: User can toggle a task's status to "Completed" using its ID. The system validates that the ID exists before updating the status.

**Independent Test**: A user can select a task by ID and change its status from pending to completed or vice versa. The change is reflected in the task list.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T029 [P] [US4] Contract test for toggle task status functionality in tests/contract/test_toggle_status.py
- [ ] T030 [P] [US4] Integration test for toggle status workflow in tests/integration/test_toggle_flow.py

### Implementation for User Story 4

- [x] T031 [US4] Add update_task_status method to TaskService in src/services/task_service.py
- [x] T032 [US4] Add task existence validation in src/services/task_service.py
- [x] T033 [US4] Implement toggle status handler in src/cli/main.py
- [x] T034 [US4] Add ID validation for toggle operation in src/lib/utils.py

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Update or Delete Task (Priority: P2)

**Goal**: User can update a task's details (Title or Description) or delete it permanently by ID. The system validates that the ID exists before performing the operation.

**Independent Test**: A user can update task details or delete a task by providing its ID. The changes are reflected in the system.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T035 [P] [US5] Contract test for update task functionality in tests/contract/test_update_task.py
- [ ] T036 [P] [US5] Contract test for delete task functionality in tests/contract/test_delete_task.py
- [ ] T037 [P] [US5] Integration test for update/delete workflow in tests/integration/test_modify_flow.py

### Implementation for User Story 5

- [x] T038 [US5] Add update_task method to TaskService in src/services/task_service.py
- [x] T039 [US5] Add delete_task method to TaskService in src/services/task_service.py
- [x] T040 [US5] Implement update task handler in src/cli/main.py
- [x] T041 [US5] Implement delete task handler in src/cli/main.py
- [x] T042 [US5] Add ID validation for update/delete operations in src/lib/utils.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Documentation updates in docs/
- [x] T044 Code cleanup and refactoring
- [x] T045 [P] Additional unit tests in tests/unit/test_task.py and tests/unit/test_task_service.py
- [x] T046 Error handling consistency across all operations
- [x] T047 [P] Run quickstart validation to ensure application works as expected

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with previous stories but should be independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - May integrate with previous stories but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for main menu functionality in tests/contract/test_main_menu.py"
Task: "Integration test for menu navigation in tests/integration/test_menu_flow.py"

# Launch main implementation for User Story 1:
Task: "Implement main application loop in src/cli/main.py"
Task: "Create menu display function in src/cli/main.py"
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
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
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