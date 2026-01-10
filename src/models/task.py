"""
Task model for the Console Todo App.

This module defines the Task class with attributes and validation logic
as specified in the data model.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class Task:
    """
    Represents a single todo task with ID, Title, Description, and Status attributes.

    Attributes:
        id (int): Unique identifier for the task; auto-incremented
        title (str): Required title of the task; must not be empty
        description (str): Optional description of the task; can be empty
        status (str): Status of the task; either "pending" or "completed"; defaults to "pending"
    """
    id: int
    title: str
    description: Optional[str] = ""
    status: str = "pending"

    def __post_init__(self):
        """Validate task attributes after initialization."""
        if not self.title or not self.title.strip():
            raise ValueError("Title must be provided and cannot be empty")

        if self.status not in ["pending", "completed"]:
            raise ValueError("Status must be either 'pending' or 'completed'")

        if self.id <= 0:
            raise ValueError("ID must be a positive integer")

    def complete(self):
        """Mark the task as completed."""
        self.status = "completed"

    def mark_pending(self):
        """Mark the task as pending."""
        self.status = "pending"

    def __str__(self):
        """Return string representation of the task."""
        status_symbol = "[x]" if self.status == "completed" else "[ ]"
        return f"{status_symbol} {self.id}. {self.title} - {self.description if self.description else '(No description)'}"