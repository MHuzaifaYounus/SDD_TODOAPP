"""
Utility functions for the Console Todo App.

This module contains helper functions for input validation,
formatting, and other common operations.
"""


def validate_task_title(title: str) -> bool:
    """
    Validate that a task title is not empty.

    Args:
        title (str): The title to validate

    Returns:
        bool: True if title is valid, False otherwise
    """
    return bool(title and title.strip())


def validate_task_id(task_id: str) -> bool:
    """
    Validate that a task ID is a positive integer.

    Args:
        task_id (str): The task ID to validate (as string from input)

    Returns:
        bool: True if task ID is valid, False otherwise
    """
    try:
        id_num = int(task_id)
        return id_num > 0
    except ValueError:
        return False


def format_task_display(task) -> str:
    """
    Format a task for display with the required [x]/[ ] notation.

    Args:
        task: A task object with id, title, description, and status attributes

    Returns:
        str: Formatted string representation of the task
    """
    status_symbol = "[x]" if task.status == "completed" else "[ ]"
    description = task.description if task.description else "(No description)"
    return f"{status_symbol} [{task.id}] {task.title} - {description}"


def format_tasks_list(tasks) -> str:
    """
    Format a list of tasks for display.

    Args:
        tasks: A list of task objects

    Returns:
        str: Formatted string with all tasks
    """
    if not tasks:
        return "No tasks found."

    task_lines = []
    for task in tasks:
        task_lines.append(format_task_display(task))

    return "\n".join(task_lines)


def get_positive_int_input(prompt: str) -> int:
    """
    Get a positive integer input from the user.

    Args:
        prompt (str): The prompt to display to the user

    Returns:
        int: The positive integer entered by the user
    """
    while True:
        try:
            value = int(input(prompt))
            if value > 0:
                return value
            else:
                print("Please enter a positive number.")
        except ValueError:
            print("Please enter a valid number.")


def safe_int_input(prompt: str, default=None):
    """
    Safely get an integer input from the user.

    Args:
        prompt (str): The prompt to display to the user
        default: The default value to return if input is invalid

    Returns:
        int: The integer entered by the user or the default value
    """
    try:
        return int(input(prompt))
    except ValueError:
        return default


def display_error(message: str):
    """
    Display an error message in a consistent format.

    Args:
        message (str): The error message to display
    """
    print(f"\n❌ Error: {message}\n")


def display_success(message: str):
    """
    Display a success message in a consistent format.

    Args:
        message (str): The success message to display
    """
    print(f"\n✅ {message}\n")


def confirm_action(prompt: str) -> bool:
    """
    Ask the user to confirm an action.

    Args:
        prompt (str): The confirmation prompt

    Returns:
        bool: True if user confirms, False otherwise
    """
    response = input(f"{prompt} (y/N): ").lower().strip()
    return response in ['y', 'yes']