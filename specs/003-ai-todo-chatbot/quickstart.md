# Quickstart Guide: Todo AI Chatbot Basic Level Functionality

## 1. Overview

This guide provides instructions to quickly set up and run the Todo AI Chatbot, an AI-powered conversational interface for managing todo tasks. The application consists of a Python FastAPI backend, an MCP (Model Context Protocol) server for task operations, and an OpenAI ChatKit-based frontend.

## 2. Prerequisites

Before you begin, ensure you have the following installed:

-   **Git**: For cloning the repository.
-   **Python 3.11+**: For the backend and MCP server.
-   **Node.js LTS**: For the frontend.
-   **Poetry**: Python package manager (`pip install poetry`).
-   **Docker** (Optional, for database or local development setup if not using Neon directly).
-   **Neon Serverless PostgreSQL Account**: Required for the database. Obtain your connection string.
-   **OpenAI API Key**: Required for the OpenAI Agents SDK and ChatKit integration.
-   **OpenAI Domain Allowlist Configuration**: If deploying the ChatKit frontend, ensure your domain is added to OpenAI's allowlist (see Feature Spec for details).

## 3. Setup

### 3.1. Backend and MCP Server

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/todo-ai-chatbot.git
    cd todo-ai-chatbot/backend
    ```
    *(Note: Assuming 'backend' is the root of the Python project, adjust path if necessary)*

2.  **Create a Python virtual environment and install dependencies**:
    ```bash
    poetry install
    ```

3.  **Database Configuration**:
    Create a `.env` file in the `backend/` directory with your Neon PostgreSQL connection string:
    ```
    DATABASE_URL="postgresql://user:password@host/database"
    ```
    Replace the placeholder with your actual Neon connection string.

4.  **Run database migrations**:
    ```bash
    poetry run alembic upgrade head
    ```
    *(Note: This assumes Alembic is used for migrations, which is common with SQLModel/FastAPI)*

5.  **OpenAI API Key**:
    Add your OpenAI API Key to the `.env` file:
    ```
    OPENAI_API_KEY="your-openai-api-key"
    ```

### 3.2. Frontend (ChatKit)

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Install Node.js dependencies**:
    ```bash
    npm install
    # or yarn install
    ```

3.  **Environment Variables for ChatKit**:
    Create a `.env` file in the `frontend/` directory. If you deployed your frontend and configured OpenAI's domain allowlist, add your domain key:
    ```
    NEXT_PUBLIC_OPENAI_DOMAIN_KEY="your-openai-domain-key"
    ```
    If running locally, this might not be strictly necessary, but it's good practice.

## 4. Running the Application

### 4.1. Start the Backend and MCP Server

From the `backend/` directory:
```bash
poetry run uvicorn src.main:app --reload
```
This will start the FastAPI application, including the MCP server components, typically on `http://127.0.0.1:8000`.

### 4.2. Start the Frontend

From the `frontend/` directory:
```bash
npm run dev
# or yarn dev
```
This will start the ChatKit frontend, typically on `http://localhost:3000`.

## 5. Usage

1.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:3000`).
2.  Start interacting with the AI Chatbot by typing natural language commands to manage your todo tasks. Examples:
    -   "Add a task to buy groceries"
    -   "Show me all my pending tasks"
    -   "Mark task 5 as complete"
    -   "Delete the meeting task"
    -   "Change task 1 to 'Call mom tonight'"

## 6. MCP Server Setup (Internal)

The MCP server is integrated within the FastAPI backend. Its tools are exposed for the OpenAI Agent. No separate server setup is required beyond starting the backend.
The tools for `add_task`, `list_tasks`, `complete_task`, `delete_task`, and `update_task` will be defined as functions callable by the OpenAI Agents SDK.
