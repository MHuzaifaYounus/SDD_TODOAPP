# Quickstart Guide: Console Todo App

## Overview
This guide provides instructions for setting up and running the Console Todo App.

## Prerequisites
- Python 3.13 or higher
- uv (for dependency management)

## Setup Instructions

### 1. Clone or Create the Project
```bash
# Navigate to your project directory
cd /path/to/your/project
```

### 2. Initialize the Project with uv
```bash
# Create a new Python project with uv
uv init
```

### 3. Create the Directory Structure
```bash
mkdir -p src/{models,services,cli,lib}
mkdir -p tests/{unit,integration,contract}
```

### 4. Install Dependencies (if any)
```bash
# If additional dependencies are needed in the future:
uv add <package-name>
```

## Project Structure
```
├── src/
│   ├── models/
│   │   └── task.py          # Task data structure
│   ├── services/
│   │   └── task_service.py  # Business logic for tasks
│   ├── cli/
│   │   └── main.py          # Main CLI application
│   └── lib/
│       └── utils.py         # Utility functions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── pyproject.toml
```

## Running the Application
```bash
# Run the main CLI application
python src/cli/main.py
```

## Expected Behavior
1. The application starts and displays a menu with options: Add, List, Update, Delete, Complete, Exit
2. User can select an option by entering the corresponding number or command
3. The application performs the requested operation and returns to the main menu
4. The application continues running until the user selects the Exit option
5. All data is stored in-memory and will be lost when the application closes

## Development Commands
```bash
# Run unit tests
python -m pytest tests/unit/

# Run integration tests
python -m pytest tests/integration/

# Run all tests
python -m pytest tests/
```

## First Steps for Developers
1. Implement the Task class in `src/models/task.py`
2. Create the TaskService in `src/services/task_service.py` with CRUD operations
3. Build the CLI interface in `src/cli/main.py` with the main menu loop
4. Add utility functions in `src/lib/utils.py` for input validation and formatting
5. Write unit tests for each component