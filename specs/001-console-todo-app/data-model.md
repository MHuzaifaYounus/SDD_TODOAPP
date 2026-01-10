# Data Model: Console Todo App

## Overview
This document defines the data structures and relationships for the Console Todo App.

## Task Entity

### Attributes
- **id** (int): Unique identifier for the task; auto-incremented
- **title** (str): Required title of the task; must not be empty
- **description** (str): Optional description of the task; can be empty
- **status** (str): Status of the task; either "pending" or "completed"; defaults to "pending"

### Validation Rules
- Title must be provided (non-empty) when creating a task
- ID must be unique within the task collection
- Status must be either "pending" or "completed"
- ID must be a positive integer

### State Transitions
- **pending** → **completed**: When user toggles task status to completed
- **completed** → **pending**: When user toggles task status back to pending

## Task Collection

### Structure
- **tasks** (list): In-memory list of Task objects
- Operations: Add, Retrieve by ID, Update by ID, Delete by ID

### Constraints
- All operations must validate that the task ID exists before performing the operation
- Delete operation permanently removes the task from memory
- Update operation modifies only the specified fields (title, description, or status)

## Relationships
- No relationships needed as this is a single entity application
- Each task is independent of others in the collection