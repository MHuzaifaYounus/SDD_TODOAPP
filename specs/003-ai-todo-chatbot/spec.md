# Feature Specification: Todo AI Chatbot Basic Level Functionality

**Feature Branch**: `003-ai-todo-chatbot`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "Phase III: Todo AI Chatbot Basic Level Functionality Objective: Create an AI-powered chatbot interface for managing todos through natural language using MCP (Model Context Protocol) server architecture and using Claude Code and Spec-Kit Plus. Development Approach: Use the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding allowed. We will review the process, prompts, and iterations to judge each phase and project. Requirements Implement conversational interface for all Basic Level features Use OpenAI Agents SDK for AI logic Build MCP server with Official MCP SDK that exposes task operations as tools Stateless chat endpoint that persists conversation state to database AI agents use MCP tools to manage tasks. The MCP tools will also be stateless and will store state in the database. Technology Stack Component Technology Frontend OpenAI ChatKit Backend Python FastAPI AI Framework OpenAI Agents SDK MCP Server Official MCP SDK ORM SQLModel Database Neon Serverless PostgreSQL Authentication Better Auth Architecture ┌─────────────────┐ ┌──────────────────────────────────────────────┐ ┌─────────────────┐ │ │ │ FastAPI Server │ │ │ │ │ │ ┌────────────────────────────────────────┐ │ │ │ │ ChatKit UI │────▶│ │ Chat Endpoint │ │ │ Neon DB │ │ (Frontend) │ │ │ POST /api/chat │ │ │ (PostgreSQL) │ │ │ │ └───────────────┬────────────────────────┘ │ │ │ │ │ │ │ │ │ - tasks │ │ │ │ ▼ │ │ - conversations│ │ │ │ ┌────────────────────────────────────────┐ │ │ - messages │ │ │◀────│ │ OpenAI Agents SDK │ │ │ │ │ │ │ │ (Agent + Runner) │ │ │ │ │ │ │ └───────────────┬────────────────────────┘ │ │ │ │ │ │ │ │ │ │ │ │ │ ▼ │ │ │ │ │ │ ┌────────────────────────────────────────┐ │────▶│ │ │ │ │ │ MCP Server │ │ │ │ │ │ │ │ (MCP Tools for Task Operations) │ │◀────│ │ │ │ │ └────────────────────────────────────────┘ │ │ │ └─────────────────┘ └──────────────────────────────────────────────┘ └─────────────────┘ Database Models Model Fields Description Task user_id, id, title, description, completed, created_at, updated_at Todo items Conversation user_id, id, created_at, updated_at Chat session Message user_id, id, conversation_id, role (user/assistant), content, created_at Chat history Chat API Endpoint Method Endpoint Description POST /api/{user_id}/chat Send message & get AI response Request Field Type Required Description conversation_id integer No Existing conversation ID (creates new if not provided) message string Yes User's natural language message Response Field Type Description conversation_id integer The conversation ID response string AI assistant's response tool_calls array List of MCP tools invoked MCP Tools Specification The MCP server must expose the following tools for the AI agent: Tool: add_task Purpose Create a new task Parameters user_id (string, required), title (string, required), description (string, optional) Returns task_id, status, title Example Input {“user_id”: “ziakhan”, "title": "Buy groceries", "description": "Milk, eggs, bread"} Example Output {"task_id": 5, "status": "created", "title": "Buy groceries"} Tool: list_tasks Purpose Retrieve tasks from the list Parameters status (string, optional: "all", "pending", "completed") Returns Array of task objects Example Input {user_id (string, required), "status": "pending"} Example Output [{"id": 1, "title": "Buy groceries", "completed": false}, ...] Tool: complete_task Purpose Mark a task as complete Parameters user_id (string, required), task_id (integer, required) Returns task_id, status, title Example Input {“user_id”: “ziakhan”, "task_id": 3} Example Output {"task_id": 3, "status": "completed", "title": "Call mom"} Tool: delete_task Purpose Remove a task from the list Parameters user_id (string, required), task_id (integer, required) Returns task_id, status, title Example Input {“user_id”: “ziakhan”, "task_id": 2} Example Output {"task_id": 2, "status": "deleted", "title": "Old task"} Tool: update_task Purpose Modify task title or description Parameters user_id (string, required), task_id (integer, required), title (string, optional), description (string, optional) Returns task_id, status, title Example Input {“user_id”: “ziakhan”, "task_id": 1, "title": "Buy groceries and fruits"} Example Output {"task_id": 1, "status": "updated", "title": "Buy groceries and fruits"} Agent Behavior Specification Behavior Description Task Creation When user mentions adding/creating/remembering something, use add_task Task Listing When user asks to see/show/list tasks, use list_tasks with appropriate filter Task Completion When user says done/complete/finished, use complete_task Task Deletion When user says delete/remove/cancel, use delete_task Task Update When user says change/update/rename, use update_task Confirmation Always confirm actions with friendly response Error Handling Gracefully handle task not found and other errors Conversation Flow (Stateless Request Cycle) Receive user message Fetch conversation history from database Build message array for agent (history + new message) Store user message in database Run agent with MCP tools Agent invokes appropriate MCP tool(s) Store assistant response in database Return response to client Server holds NO state (ready for next request) Natural Language Commands The chatbot should understand and respond to: User Says Agent Should "Add a task to buy groceries" Call add_task with title "Buy groceries" "Show me all my tasks" Call list_tasks with status "all" "What's pending?" Call list_tasks with status "pending" "Mark task 3 as complete" Call complete_task with task_id 3 "Delete the meeting task" Call list_tasks first, then delete_task "Change task 1 to 'Call mom tonight'" Call update_task with new title "I need to remember to pay bills" Call add_task with title "Pay bills" "What have I completed?" Call list_tasks with status "completed" Deliverables GitHub repository with: /frontend – ChatKit-based UI /backend – FastAPI + Agents SDK + MCP /specs – Specification files for agent and MCP tools Database migration scripts README with setup instructions Working chatbot that can: Manage tasks through natural language via MCP tools Maintain conversation context via database (stateless server) Provide helpful responses with action confirmations Handle errors gracefully Resume conversations after server restart OpenAI ChatKit Setup & Deployment Domain Allowlist Configuration (Required for Hosted ChatKit) Before deploying your chatbot frontend, you must configure OpenAI's domain allowlist for security: Deploy your frontend first to get a production URL: Vercel: `https://your-app.vercel.app` GitHub Pages: `https://username.github.io/repo-name` Custom domain: `https://yourdomain.com` Add your domain to OpenAI's allowlist: Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist Click "Add domain" Enter your frontend URL (without trailing slash) Save changes Get your ChatKit domain key: After adding the domain, OpenAI will provide a domain key Pass this key to your ChatKit configuration Environment Variables NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here Note: The hosted ChatKit option only works after adding the correct domains under Security → Domain Allowlist. Local development (`localhost`) typically works without this configuration. Key Architecture Benefits Aspect Benefit MCP Tools Standardized interface for AI to interact with your app Single Endpoint Simpler API — AI handles routing to tools Stateless Server Scalable, resilient, horizontally scalable Tool Composition Agent can chain multiple tools in one turn Key Stateless Architecture Benefits Scalability: Any server instance can handle any request Resilience: Server restarts don't lose conversation state Horizontal scaling: Load balancer can route to any backend Testability: Each request is independent and reproducible"

## User Scenarios & Testing

### User Story 1 - Add a new task (Priority: P1)

Users should be able to create new todo tasks using natural language.

**Why this priority**: Core functionality for any todo application. Without adding tasks, other features are irrelevant.

**Independent Test**: Can be fully tested by providing a natural language command to add a task and verifying its presence in the task list and a confirmation response.

**Acceptance Scenarios**:

1.  **Given** the user says "Add a task to buy groceries", **When** the AI processes the request, **Then** the `add_task` tool is called with `title: "Buy groceries"` (and potentially a description if provided), and the system responds with a friendly confirmation including the new task's details.
2.  **Given** the user says "I need to remember to pay bills", **When** the AI processes the request, **Then** the `add_task` tool is called with `title: "Pay bills"`, and the system responds with a friendly confirmation including the new task's details.

### User Story 2 - View tasks (Priority: P1)

Users should be able to view their existing todo tasks, with options to filter by status.

**Why this priority**: Essential for users to track their progress and see what needs to be done.

**Independent Test**: Can be fully tested by providing natural language commands to list tasks and verifying the returned list matches expected tasks based on filters.

**Acceptance Scenarios**:

1.  **Given** tasks exist (e.g., pending and completed), **When** the user says "Show me all my tasks", **Then** the `list_tasks` tool is called with `status: "all"`, and the system responds with an array of all task objects.
2.  **Given** pending tasks exist, **When** the user says "What's pending?", **Then** the `list_tasks` tool is called with `status: "pending"`, and the system responds with an array of pending task objects.
3.  **Given** completed tasks exist, **When** the user says "What have I completed?", **Then** the `list_tasks` tool is called with `status: "completed"`, and the system responds with an array of completed task objects.

### User Story 3 - Complete a task (Priority: P1)

Users should be able to mark an existing task as complete using natural language.

**Why this priority**: A fundamental action for managing tasks, indicating completion.

**Independent Test**: Can be fully tested by instructing the AI to complete a task and then verifying its status in the task list.

**Acceptance Scenarios**:

1.  **Given** a task with a known ID (e.g., ID 3) exists and is pending, **When** the user says "Mark task 3 as complete", **Then** the `complete_task` tool is called with `task_id: 3`, and the system responds with a friendly confirmation of the task's completion.

### User Story 4 - Delete a task (Priority: P2)

Users should be able to remove an existing task using natural language.

**Why this priority**: Allows users to clean up their task list and remove irrelevant items.

**Independent Test**: Can be fully tested by instructing the AI to delete a task and verifying its absence from the task list.

**Acceptance Scenarios**:

1.  **Given** a task exists (e.g., "meeting task"), **When** the user says "Delete the meeting task", **Then** the AI agent first calls `list_tasks` to identify the `task_id` for "meeting task", then calls `delete_task` with the identified `task_id`, and the system responds with a friendly confirmation of the task's deletion.

### User Story 5 - Update a task (Priority: P2)

Users should be able to modify the title or description of an existing task using natural language.

**Why this priority**: Provides flexibility for users to refine their task details.

**Independent Test**: Can be fully tested by instructing the AI to update a task's details and then verifying the changes in the task list.

**Acceptance Scenarios**:

1.  **Given** a task with a known ID (e.g., ID 1) exists, **When** the user says "Change task 1 to 'Call mom tonight'", **Then** the `update_task` tool is called with `task_id: 1` and `title: "Call mom tonight"`, and the system responds with a friendly confirmation of the task's update.

### Edge Cases

-   What happens when a task ID is provided for completion, deletion, or update, but the task with that ID does not exist?
-   How does the system handle ambiguous task names for deletion or update if multiple tasks match the natural language query?
-   What happens when a user provides a natural language message that does not map to any known task operation?
-   How does the system ensure conversation context is accurately maintained across multiple user interactions for a given `conversation_id` in a stateless server environment?

## Requirements

### Functional Requirements

-   **FR-001**: The system MUST provide a conversational interface for managing tasks.
-   **FR-002**: The system MUST integrate with an OpenAI Agents SDK for AI logic.
-   **FR-003**: The system MUST build an MCP server that exposes task operations (add, list, complete, delete, update) as tools for the AI agent.
-   **FR-004**: The system MUST persist conversation state (messages) to a database to ensure stateless server operation.
-   **FR-005**: The system MUST support adding new tasks with a title and an optional description.
-   **FR-006**: The system MUST support listing tasks filtered by status (all, pending, completed).
-   **FR-007**: The system MUST support marking existing tasks as complete.
-   **FR-008**: The system MUST support deleting existing tasks.
-   **FR-009**: The system MUST support updating the title or description of existing tasks.
-   **FR-010**: The system MUST confirm actions to the user with friendly responses.
-   **FR-011**: The system MUST gracefully handle cases where a specified task is not found, providing appropriate feedback to the user.
-   **FR-012**: The system MUST store tasks, conversations, and messages in a database (Neon Serverless PostgreSQL).
-   **FR-013**: The system MUST expose a chat API endpoint (`POST /api/{user_id}/chat`) to send messages and receive AI responses, including any MCP tools invoked.
-   **FR-014**: The MCP tools exposed by the MCP server MUST be stateless and store their state in the database.

### Key Entities

-   **Task**: Represents a single todo item.
    -   Attributes: `user_id` (string), `id` (integer), `title` (string), `description` (string, optional), `completed` (boolean), `created_at` (datetime), `updated_at` (datetime).
-   **Conversation**: Represents a chat session.
    -   Attributes: `user_id` (string), `id` (integer), `created_at` (datetime), `updated_at` (datetime).
-   **Message**: Represents a single message within a conversation.
    -   Attributes: `user_id` (string), `id` (integer), `conversation_id` (integer), `role` (string: "user"/"assistant"), `content` (string), `created_at` (datetime).

## Dependencies and Assumptions

*   **External Dependencies**:
    *   OpenAI Agents SDK is available and functional for AI logic.
    *   Official MCP SDK is available and functional for building the MCP server.
    *   Neon Serverless PostgreSQL is available and accessible as the database.
    *   Better Auth provides a robust authentication mechanism.
    *   OpenAI ChatKit will be used for the frontend.
*   **Assumptions**:
    *   A user authentication system (Better Auth) is already in place or will be integrated as a separate component, providing `user_id` for all operations.
    *   The `conversation_id` for chat endpoint requests is managed by the frontend (ChatKit) and passed to the backend.
    *   The MCP server will handle the mapping of natural language requests to specific MCP tool calls.
    *   Scalability, resilience, and horizontal scaling are inherent benefits of the stateless architecture, as outlined in the prompt, and will be realized through proper deployment and infrastructure.

## Success Criteria

### Measurable Outcomes

-   **SC-001**: Users can successfully manage tasks (add, list, complete, delete, update) through natural language commands with a 95% accuracy rate, meaning the AI agent correctly interprets and executes the intended operation.
-   **SC-002**: The chatbot maintains accurate conversation context across multiple turns for 99% of interactions within a session, allowing for coherent follow-up questions and commands.
-   **SC-003**: All task management operations (add, list, complete, delete, update) initiated via the chat interface return a confirmed response to the user within 2 seconds.
-   **SC-004**: The system correctly handles and provides user-friendly error messages for 100% of invalid task IDs, ambiguous natural language requests, or other system errors, preventing crashes or uninformative responses.
-   **SC-005**: The system ensures data consistency and integrity for tasks, conversations, and messages stored in the database, with no data loss or corruption observed.
