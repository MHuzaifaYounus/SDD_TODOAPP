# Tasks: In-Memory Python Console App

**Input**: Design documents from `/specs/001-in-memory-console-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Test tasks are included as `plan.md` specified `pytest` for unit and integration testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create `pyproject.toml` for Python project configuration
- [ ] T002 Create directory `src/cli/`
- [ ] T003 Create directory `src/lib/`
- [ ] T004 Create directory `tests/unit/`
- [ ] T005 Create directory `tests/integration/`
- [ ] T006 Configure `pytest` for the project in `pyproject.toml` or `pytest.ini`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Implement `Session` class using `code.InteractiveConsole` in `src/lib/session.py` to manage in-memory state.
- [ ] T008 Implement `REPLCore` class in `src/lib/repl_core.py` to handle the read-eval-print loop, utilizing `src/lib/session.py`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

## Phase 3: User Story 1 - Interactive Python Code Execution (Priority: P1) 🎯 MVP

**Goal**: Enable a user to start the application, type and execute Python code, and maintain session state.

**Independent Test**: The application can be launched, a sequence of Python commands can be executed (e.g., variable definition, usage, function calls), and the correct output is displayed, ultimately allowing graceful exit.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Create unit tests for `Session` class in `tests/unit/test_session.py`.
- [ ] T010 [P] [US1] Create unit tests for `REPLCore` class in `tests/unit/test_repl_core.py`.
- [ ] T011 [US1] Create integration tests for the CLI application startup and basic command execution in `tests/integration/test_cli.py`.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create main CLI entry point in `src/cli/main.py`.
- [ ] T013 [US1] Integrate `REPLCore` from `src/lib/repl_core.py` into `src/cli/main.py` to run the REPL.
- [ ] T014 [US1] Implement welcome message and display prompt (e.g., `>>> `) in `src/cli/main.py`.
- [ ] T015 [US1] Implement handling of user input and display of output in `src/cli/main.py`.
- [ ] T016 [US1] Implement graceful exit for `exit()` command and `Ctrl+C` in `src/cli/main.py`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 Implement graceful handling and display of Python tracebacks for invalid code without crashing the application in `src/cli/main.py`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 can proceed after Foundational phase.
- **Polish (Final Phase)**: Depends on User Story 1 being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.

### Within Each User Story

- Tests MUST be written and FAIL before implementation.
- `Session` and `REPLCore` classes must be implemented before their integration into the CLI.
- Core CLI implementation before integration.
- Story complete before moving to next priority.

### Parallel Opportunities

- All Setup tasks (T001-T006) marked [P] can run in parallel.
- Tests within User Story 1 (T009-T010) marked [P] can run in parallel.
- CLI entry point creation (T012) can run in parallel with some other tasks in US1.

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
- [ ] T009 [P] [US1] Create unit tests for `Session` class in `tests/unit/test_session.py`
- [ ] T010 [P] [US1] Create unit tests for `REPLCore` class in `tests/unit/test_repl_core.py`

# Parallel implementation tasks within User Story 1:
- [ ] T012 [P] [US1] Create main CLI entry point in `src/cli/main.py`
# Other implementation tasks will follow sequentially based on dependencies.
```

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
3. Add Polish tasks.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: Tests for User Story 1
3. Stories complete and integrate independently

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
