# Data Model: Todo AI Chatbot Basic Level Functionality

This document outlines the database schema for the Todo AI Chatbot, based on the entities identified in the feature specification.

## Entities

### Entity: Task

-   **Description**: Represents a single todo item managed by the user.
-   **Fields**:
    -   `user_id`: `STRING` (References User entity, non-nullable)
    -   `id`: `INTEGER` (Primary Key, auto-increment)
    -   `title`: `STRING` (Non-nullable, brief description of the task)
    -   `description`: `STRING` (Nullable, detailed description of the task)
    -   `completed`: `BOOLEAN` (Default: `FALSE`, indicates task completion status)
    -   `created_at`: `DATETIME` (Default: current timestamp, records when the task was created)
    -   `updated_at`: `DATETIME` (Default: current timestamp, automatically updated on modification)
-   **Relationships**:
    -   Many-to-one with `User` (via `user_id`)

### Entity: Conversation

-   **Description**: Represents a chat session between a user and the AI assistant.
-   **Fields**:
    -   `user_id`: `STRING` (References User entity, non-nullable)
    -   `id`: `INTEGER` (Primary Key, auto-increment)
    -   `created_at`: `DATETIME` (Default: current timestamp, records when the conversation started)
    -   `updated_at`: `DATETIME` (Default: current timestamp, automatically updated on modification)
-   **Relationships**:
    -   Many-to-one with `User` (via `user_id`)
    -   One-to-many with `Message`

### Entity: Message

-   **Description**: Represents a single message exchanged within a conversation.
-   **Fields**:
    -   `user_id`: `STRING` (References User entity, non-nullable)
    -   `id`: `INTEGER` (Primary Key, auto-increment)
    -   `conversation_id`: `INTEGER` (References Conversation entity, non-nullable)
    -   `role`: `STRING` (Non-nullable, e.g., "user", "assistant", "system")
    -   `content`: `STRING` (Non-nullable, the text content of the message)
    -   `created_at`: `DATETIME` (Default: current timestamp, records when the message was created)
-   **Relationships**:
    -   Many-to-one with `User` (via `user_id`)
    -   Many-to-one with `Conversation` (via `conversation_id`)
