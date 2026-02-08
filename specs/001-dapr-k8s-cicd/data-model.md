# Data Model: Phase V - Distributed Cloud Infrastructure

**Feature Branch**: `001-dapr-k8s-cicd`  
**Date**: 2026-02-08  
**Plan**: [specs/001-dapr-k8s-cicd/plan.md](specs/001-dapr-k8s-cicd/plan.md)
**Spec**: [specs/001-dapr-k8s-cicd/spec.md](specs/001-dapr-k8s-cicd/spec.md)

## Task Entity Updates

The existing `Task` entity will be extended to support reminder and recurring task functionality.

-   **`id`**: (Existing) Unique identifier for the task.
-   **`title`**: (Existing) Title or name of the task.
-   **`description`**: (Existing) Detailed description of the task.
-   **`dueDate`**: (Existing) The date/time when the task is due.
-   **`isCompleted`**: (Existing) Boolean indicating if the task is completed.
-   **`userId`**: (Existing) Identifier for the user who owns the task.
-   **`reminderTime`**: (New) `timestamp` (nullable). The specific time a reminder should be triggered for this task.
-   **`isRecurring`**: (New) `boolean` (default: `false`). Flag indicating if the task is a recurring task.
-   **`recurrencePattern`**: (New) `string` (nullable). Defines the pattern for recurring tasks (e.g., "daily", "weekly", "monthly", or a CRON-like expression). Only applicable if `isRecurring` is `true`.
-   **`lastRecurrenceDate`**: (New) `timestamp` (nullable). Stores the last date a new task was spawned from this recurring task. Useful for managing recurrence logic and preventing duplicates.

## Event Data Structures (for Kafka Messages)

These represent the payload for messages published to Kafka topics, not persisted database entities.

### ReminderEvent

-   **`taskId`**: `string` (UUID) - ID of the task for which the reminder is.
-   **`userId`**: `string` (UUID) - ID of the user who owns the task.
-   **`message`**: `string` - The notification message content.
-   **`reminderTimestamp`**: `timestamp` - The original timestamp for which the reminder was set.

### RecurringTaskEvent

-   **`originalTaskId`**: `string` (UUID) - ID of the original recurring task.
-   **`userId`**: `string` (UUID) - ID of the user who owns the task.
-   **`nextDueDate`**: `timestamp` - The calculated due date for the new task to be spawned.
-   **`recurrencePattern`**: `string` - The recurrence pattern from the original task.
