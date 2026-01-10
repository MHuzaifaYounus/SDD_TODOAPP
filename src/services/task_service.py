"""
Task Service for the Console Todo App.

This module provides the core logic for CRUD operations on tasks
using in-memory storage as specified in the requirements.
"""
from typing import List, Optional
from src.models.task import Task


class TaskService:
    """
    Service class that handles all task-related operations using in-memory storage.
    """
    def __init__(self):
        """Initialize the TaskService with an empty task list and next ID counter."""
        self._tasks: List[Task] = []
        self._next_id = 1

    def create_task(self, title: str, description: str = "") -> Task:
        """
        Create a new task with the given title and optional description.

        Args:
            title (str): Required title of the task
            description (str): Optional description of the task

        Returns:
            Task: The newly created task with a unique ID and "pending" status

        Raises:
            ValueError: If title is empty or invalid
        """
        # Validate title is not empty
        if not title or not title.strip():
            raise ValueError("Title must be provided and cannot be empty")

        # Create task with unique ID
        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description.strip() if description else "",
            status="pending"
        )

        # Add to collection
        self._tasks.append(task)

        # Increment ID for next task
        self._next_id += 1

        return task

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by its ID.

        Args:
            task_id (int): The ID of the task to retrieve

        Returns:
            Task: The task with the given ID, or None if not found
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks.

        Returns:
            List[Task]: A list of all tasks
        """
        return self._tasks.copy()  # Return a copy to prevent external modification

    def update_task(self, task_id: int, title: Optional[str] = None,
                   description: Optional[str] = None, status: Optional[str] = None) -> Optional[Task]:
        """
        Update a task's details.

        Args:
            task_id (int): The ID of the task to update
            title (str, optional): New title for the task
            description (str, optional): New description for the task
            status (str, optional): New status for the task

        Returns:
            Task: The updated task, or None if task with given ID doesn't exist
        """
        task = self.get_task_by_id(task_id)
        if not task:
            return None

        # Update fields if provided
        if title is not None:
            task.title = title.strip() if title.strip() else task.title
        if description is not None:
            task.description = description.strip() if description else ""
        if status is not None:
            if status in ["pending", "completed"]:
                task.status = status

        return task

    def update_task_status(self, task_id: int, status: str) -> Optional[Task]:
        """
        Update a task's status.

        Args:
            task_id (int): The ID of the task to update
            status (str): The new status ("pending" or "completed")

        Returns:
            Task: The updated task, or None if task with given ID doesn't exist
        """
        if status not in ["pending", "completed"]:
            raise ValueError("Status must be either 'pending' or 'completed'")

        task = self.get_task_by_id(task_id)
        if not task:
            return None

        task.status = status
        return task

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task permanently.

        Args:
            task_id (int): The ID of the task to delete

        Returns:
            bool: True if task was deleted, False if task didn't exist
        """
        task = self.get_task_by_id(task_id)
        if not task:
            return False

        self._tasks.remove(task)
        return True

    def task_exists(self, task_id: int) -> bool:
        """
        Check if a task with the given ID exists.

        Args:
            task_id (int): The ID of the task to check

        Returns:
            bool: True if task exists, False otherwise
        """
        return self.get_task_by_id(task_id) is not None