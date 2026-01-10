# API Contracts: Console Todo App

## Overview
This document defines the functional contracts for the Console Todo App operations.

## Task Management Operations

### Add Task
- **Input**: title (string, required), description (string, optional)
- **Output**: task object with id, title, description, status
- **Success**: Task is added to the in-memory collection with unique ID and "pending" status
- **Validation**: Title must not be empty
- **Error Cases**:
  - Empty title: Display error message and prompt again
  - Invalid input: Handle gracefully without crashing

### List Tasks
- **Input**: None
- **Output**: List of all tasks with ID, Title, Status, and Description
- **Success**: All tasks displayed with [x] for completed and [ ] for pending
- **Error Cases**: None (empty list is valid)

### Update Task
- **Input**: task ID (int), new title (optional), new description (optional)
- **Output**: Updated task object
- **Success**: Task details updated in the collection
- **Validation**: Task ID must exist in collection
- **Error Cases**:
  - Invalid ID: Display error message and return to menu
  - Invalid input: Handle gracefully without crashing

### Delete Task
- **Input**: task ID (int)
- **Output**: Confirmation of deletion
- **Success**: Task permanently removed from collection
- **Validation**: Task ID must exist in collection
- **Error Cases**:
  - Invalid ID: Display error message and return to menu
  - Invalid input: Handle gracefully without crashing

### Toggle Task Status
- **Input**: task ID (int)
- **Output**: Task object with updated status
- **Success**: Task status changed from pending to completed or vice versa
- **Validation**: Task ID must exist in collection
- **Error Cases**:
  - Invalid ID: Display error message and return to menu
  - Invalid input: Handle gracefully without crashing

### Exit Application
- **Input**: Exit command/selection
- **Output**: Graceful termination of application
- **Success**: Application terminates without errors
- **Error Cases**: None expected