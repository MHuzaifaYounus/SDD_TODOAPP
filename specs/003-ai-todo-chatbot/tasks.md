# Tasks for Todo AI Chatbot Basic Level Functionality

**Feature Branch**: `003-ai-todo-chatbot`
**Date**: 2026-02-05
**Spec**: specs/003-ai-todo-chatbot/spec.md
**Plan**: specs/003-ai-todo-chatbot/plan.md

## Implementation Strategy

The implementation will follow an iterative approach, starting with foundational components and then building out user stories in priority order (P1 first, then P2). Each user story will be developed as a complete, independently testable increment.

## Phase 1: Setup

Initial project setup and configuration.

-   [ ] T001 Initialize backend Poetry project in `backend/`
-   [ ] T002 Create initial FastAPI application structure in `backend/src/main.py`
-   [ ] T003 Initialize frontend Node.js project in `frontend/`
-   [ ] T004 Create basic React App structure in `frontend/src/App.tsx` and `frontend/src/index.tsx`
-   [ ] T005 Configure `.env` files for backend (`backend/.env`) and frontend (`frontend/.env`) with placeholders for `DATABASE_URL`, `OPENAI_API_KEY`, `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`

## Phase 2: Foundational

Core infrastructure components that are prerequisites for all user stories.

-   [ ] T006 [P] Implement Database connection and session management in `backend/src/db/database.py`
-   [ ] T007 [P] Define `Task` SQLModel in `backend/src/models/task.py`
-   [ ] T008 [P] Define `Conversation` SQLModel in `backend/src/models/conversation.py`
-   [ ] T009 [P] Define `Message` SQLModel in `backend/src/models/message.py`
-   [ ] T010 [P] Implement Alembic setup and initial migration for `Task`, `Conversation`, `Message` models in `backend/alembic/env.py` and `backend/alembic/versions/`
-   [ ] T011 Implement basic user identification mechanism (e.g., extract `user_id` from request headers or path, as per spec) in `backend/src/core/auth.py`

## Phase 3: User Story 1 - Add a new task (P1)

Goal: Users can successfully add new tasks through natural language.

**Independent Test**: Send a chat message like "Add a task to buy groceries" and verify a confirmation response and the task's existence in the database.

-   [ ] T012 [P] [US1] Create `add_task` MCP tool function in `backend/src/mcp_tools/task_operations.py`
-   [ ] T013 [US1] Implement `TaskService.add_task` to encapsulate logic for adding tasks to DB in `backend/src/services/task_service.py`
-   [ ] T014 [US1] Integrate `add_task` MCP tool into the OpenAI Agents SDK setup in `backend/src/api/chat.py`
-   [ ] T015 [US1] Implement `/api/{user_id}/chat` endpoint in `backend/src/api/chat.py` to receive messages, pass to agent, and return response
-   [ ] T016 [US1] Create basic chat input component (`frontend/src/components/ChatInput.tsx`) and integrate into main app (`frontend/src/App.tsx`) to allow sending messages

## Phase 4: User Story 2 - View tasks (P1)

Goal: Users can view their tasks, filtered by status, via natural language.

**Independent Test**: Send a chat message like "Show me all my tasks" or "What's pending?" and verify the list of tasks returned.

-   [ ] T017 [P] [US2] Create `list_tasks` MCP tool function in `backend/src/mcp_tools/task_operations.py`
-   [ ] T018 [US2] Implement `TaskService.list_tasks` to retrieve tasks from DB with status filtering in `backend/src/services/task_service.py`
-   [ ] T019 [US2] Integrate `list_tasks` MCP tool into the OpenAI Agents SDK setup in `backend/src/api/chat.py`
-   [ ] T020 [US2] Update chat endpoint in `backend/src/api/chat.py` to handle `list_tasks` tool calls and format agent response
-   [ ] T021 [US2] Create `TaskList` component (`frontend/src/components/TaskList.tsx`) to display tasks returned by the backend
-   [ ] T022 [US2] Integrate `TaskList` component into main app (`frontend/src/App.tsx`)

## Phase 5: User Story 3 - Complete a task (P1)

Goal: Users can mark existing tasks as complete via natural language.

**Independent Test**: Send a chat message like "Mark task 3 as complete" and verify the task's status is updated in the database and a confirmation is received.

-   [ ] T023 [P] [US3] Create `complete_task` MCP tool function in `backend/src/mcp_tools/task_operations.py`
-   [ ] T024 [US3] Implement `TaskService.complete_task` to update task status in DB in `backend/src/services/task_service.py`
-   [ ] T025 [US3] Integrate `complete_task` MCP tool into the OpenAI Agents SDK setup in `backend/src/api/chat.py`
-   [ ] T026 [US3] Update chat endpoint in `backend/src/api/chat.py` to handle `complete_task` tool calls

## Phase 6: User Story 4 - Delete a task (P2)

Goal: Users can delete existing tasks via natural language.

**Independent Test**: Send a chat message like "Delete the meeting task" and verify the task is removed from the database and a confirmation is received.

-   [ ] T027 [P] [US4] Create `delete_task` MCP tool function in `backend/src/mcp_tools/task_operations.py`
-   [ ] T028 [US4] Implement `TaskService.delete_task` to remove tasks from DB in `backend/src/services/task_service.py`
-   [ ] T029 [US4] Integrate `delete_task` MCP tool into the OpenAI Agents SDK setup in `backend/src/api/chat.py`
-   [ ] T030 [US4] Update chat endpoint in `backend/src/api/chat.py` to handle `delete_task` tool calls

## Phase 7: User Story 5 - Update a task (P2)

Goal: Users can modify task details (title/description) via natural language.

**Independent Test**: Send a chat message like "Change task 1 to 'Call mom tonight'" and verify the task details are updated in the database and a confirmation is received.

-   [ ] T031 [P] [US5] Create `update_task` MCP tool function in `backend/src/mcp_tools/task_operations.py`
-   [ ] T032 [US5] Implement `TaskService.update_task` to modify task details in DB in `backend/src/services/task_service.py`
-   [ ] T033 [US5] Integrate `update_task` MCP tool into the OpenAI Agents SDK setup in `backend/src/api/chat.py`
-   [ ] T034 [US5] Update chat endpoint in `backend/src/api/chat.py` to handle `update_task` tool calls

## Phase 8: Polish & Cross-Cutting Concerns

Enhancements, error handling, and comprehensive testing.

-   [ ] T035 [P] Implement robust error handling for all API endpoints and MCP tool calls (e.g., task not found, invalid input) in `backend/src/api/chat.py` and `backend/src/mcp_tools/`
-   [ ] T036 Implement logging and observability for backend (`backend/src/core/logging.py`)
-   [ ] T037 Write unit tests for `TaskService` and MCP tool functions (`backend/tests/unit/`)
-   [ ] T038 Write integration tests for API endpoints (`backend/tests/integration/`)
-   [ ] T039 Implement conversation history persistence in `backend/src/services/conversation_service.py` using `Conversation` and `Message` models
-   [ ] T040 Enhance frontend UI/UX for displaying conversation history and tool calls, including loading states and error messages (`frontend/src/components/`, `frontend/src/App.tsx`)
-   [ ] T041 Review and refine `quickstart.md` and project README for clear setup and usage instructions

## Dependency Graph (User Story Completion Order)

-   Phase 1 (Setup) -> Phase 2 (Foundational)
-   Phase 2 (Foundational) -> Phase 3 (US1: Add Task)
-   Phase 3 (US1: Add Task) -> Phase 4 (US2: View Tasks)
-   Phase 3 (US1: Add Task) -> Phase 5 (US3: Complete Task)
-   Phase 4 (US2: View Tasks) -> Phase 6 (US4: Delete Task)
-   Phase 4 (US2: View Tasks) -> Phase 7 (US5: Update Task)
-   Phase 5 (US3: Complete Task) -> Phase 8 (Polish)
-   Phase 6 (US4: Delete Task) -> Phase 8 (Polish)
-   Phase 7 (US5: Update Task) -> Phase 8 (Polish)

## Parallel Execution Examples

-   **Backend Model Development (P)**: `T007`, `T008`, `T009` can be worked on concurrently.
-   **Frontend Component Development (P)**: `T016`, `T021` can be developed in parallel with backend tasks, assuming API contracts are stable.
-   **MCP Tool Implementation (P)**: Individual MCP tool functions (`T012`, `T017`, `T023`, `T027`, `T031`) can be implemented in parallel once foundational services are in place.

## Suggested MVP Scope

The Minimum Viable Product (MVP) would encompass **Phase 1 (Setup), Phase 2 (Foundational), Phase 3 (User Story 1: Add a new task), Phase 4 (User Story 2: View tasks), and Phase 5 (User Story 3: Complete a task)**. This provides core task management functionality through the chatbot.
