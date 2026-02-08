"""
Task model for the Console Todo App.

This module defines the Task class with attributes and validation logic
as specified in the data model.
"""
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class Task:
    """
    Represents a single todo task with ID, Title, Description, and Status attributes.

    Attributes:
        id (int): Unique identifier for the task; auto-incremented
        title (str): Required title of the task; must not be empty
        description (str): Optional description of the task; can be empty
        status (str): Status of the task; either "pending" or "completed"; defaults to "pending"
        reminderTime (Optional[datetime]): The specific time a reminder should be triggered for this task.
        isRecurring (bool): Flag indicating if the task is a recurring task.
        recurrencePattern (Optional[str]): Defines the pattern for recurring tasks (e.g., "daily", "weekly", "monthly", or a CRON-like expression).
        lastRecurrenceDate (Optional[datetime]): Stores the last date a new task was spawned from this recurring task.
    """
    id: int
    title: str
    description: Optional[str] = ""
    status: str = "pending"
    reminderTime: Optional[datetime] = None
    isRecurring: bool = False
    recurrencePattern: Optional[str] = None
    lastRecurrenceDate: Optional[datetime] = None

    def __post_init__(self):
        """Validate task attributes after initialization."""
        if not self.title or not self.title.strip():
            raise ValueError("Title must be provided and cannot be empty")

        if self.status not in ["pending", "completed"]:
            raise ValueError("Status must be either 'pending' or 'completed'")

        if self.id <= 0:
            raise ValueError("ID must be a positive integer")

        if self.isRecurring and not self.recurrencePattern:
            raise ValueError("Recurrence pattern must be provided for recurring tasks")

    def complete(self):
        """Mark the task as completed."""
        self.status = "completed"

    def mark_pending(self):
        """Mark the task as pending."""
        self.status = "pending"

    def __str__(self):
        """Return string representation of the task."""
        status_symbol = "[x]" if self.status == "completed" else "[ ]"
        recurrence_info = f" (Recurs: {self.recurrencePattern})" if self.isRecurring else ""
        reminder_info = f" (Reminder: {self.reminderTime})" if self.reminderTime else ""
        return f"{status_symbol} {self.id}. {self.title}{recurrence_info}{reminder_info} - {self.description if self.description else '(No description)'}"