#!/usr/bin/env python3
"""
Main CLI application for the Console Todo App.

This module implements the main application loop with menu navigation
and integrates with the TaskService for all operations.
"""
import sys
import os
from typing import Optional

# Add the src directory to the path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.services.task_service import TaskService
from src.lib.utils import display_error, display_success, format_tasks_list


class TodoApp:
    """
    Main application class that handles the CLI interface and user interactions.
    """
    def __init__(self):
        """Initialize the TodoApp with a TaskService instance."""
        self.task_service = TaskService()

    def display_menu(self):
        """Display the main menu options to the user."""
        print("\n" + "="*50)
        print("           TODO APPLICATION")
        print("="*50)
        print("1. Add Task")
        print("2. List Tasks")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Complete Task")
        print("6. Exit")
        print("-"*50)

    def get_user_choice(self) -> int:
        """
        Get the user's menu choice with validation.

        Returns:
            int: The user's menu choice (1-6)
        """
        while True:
            try:
                choice = int(input("Select an option (1-6): "))
                if 1 <= choice <= 6:
                    return choice
                else:
                    print("Please enter a number between 1 and 6.")
            except ValueError:
                print("Please enter a valid number.")

    def add_task(self):
        """Handle adding a new task."""
        print("\n--- ADD TASK ---")
        title = input("Enter task title (required): ").strip()

        # Validate title
        if not title:
            display_error("Task title is required!")
            return

        description = input("Enter task description (optional, press Enter to skip): ").strip()
        if not description:
            description = ""

        try:
            task = self.task_service.create_task(title, description)
            display_success(f"Task '{task.title}' added successfully with ID {task.id}")
        except ValueError as e:
            display_error(str(e))

    def list_tasks(self):
        """Handle listing all tasks."""
        print("\n--- TASK LIST ---")
        tasks = self.task_service.get_all_tasks()

        if not tasks:
            print("No tasks found.")
        else:
            print(format_tasks_list(tasks))

    def update_task(self):
        """Handle updating a task."""
        print("\n--- UPDATE TASK ---")

        if not self.task_service.get_all_tasks():
            display_error("No tasks available to update.")
            return

        try:
            task_id = int(input("Enter task ID to update: "))

            # Check if task exists
            task = self.task_service.get_task_by_id(task_id)
            if not task:
                display_error(f"No task found with ID {task_id}")
                return

            print(f"Current task: {task.title} - {task.description}")

            # Get new values (empty input keeps current value)
            new_title = input(f"Enter new title (current: '{task.title}', press Enter to keep): ").strip()
            new_description = input(f"Enter new description (current: '{task.description}', press Enter to keep): ").strip()

            # Prepare update parameters
            update_params = {}
            if new_title:
                update_params['title'] = new_title
            if new_description:
                update_params['description'] = new_description

            # Update the task
            updated_task = self.task_service.update_task(task_id, **update_params)
            if updated_task:
                display_success(f"Task {task_id} updated successfully")
            else:
                display_error("Failed to update task")

        except ValueError:
            display_error("Invalid input. Please enter a valid task ID.")

    def delete_task(self):
        """Handle deleting a task."""
        print("\n--- DELETE TASK ---")

        if not self.task_service.get_all_tasks():
            display_error("No tasks available to delete.")
            return

        try:
            task_id = int(input("Enter task ID to delete: "))

            # Check if task exists
            if not self.task_service.task_exists(task_id):
                display_error(f"No task found with ID {task_id}")
                return

            # Confirm deletion
            confirm = input(f"Are you sure you want to delete task {task_id}? (y/N): ").lower().strip()
            if confirm in ['y', 'yes']:
                if self.task_service.delete_task(task_id):
                    display_success(f"Task {task_id} deleted successfully")
                else:
                    display_error("Failed to delete task")
            else:
                print("Deletion cancelled.")

        except ValueError:
            display_error("Invalid input. Please enter a valid task ID.")

    def complete_task(self):
        """Handle completing a task."""
        print("\n--- COMPLETE TASK ---")

        if not self.task_service.get_all_tasks():
            display_error("No tasks available to complete.")
            return

        try:
            task_id = int(input("Enter task ID to toggle status: "))

            # Check if task exists
            task = self.task_service.get_task_by_id(task_id)
            if not task:
                display_error(f"No task found with ID {task_id}")
                return

            # Toggle status
            new_status = "completed" if task.status != "completed" else "pending"
            updated_task = self.task_service.update_task_status(task_id, new_status)

            if updated_task:
                status_msg = "completed" if new_status == "completed" else "marked as pending"
                display_success(f"Task {task_id} {status_msg}")
            else:
                display_error("Failed to update task status")

        except ValueError:
            display_error("Invalid input. Please enter a valid task ID.")

    def run(self):
        """Main application loop that runs until user chooses to exit."""
        print("Welcome to the Todo Application!")

        while True:
            try:
                self.display_menu()
                choice = self.get_user_choice()

                if choice == 1:
                    self.add_task()
                elif choice == 2:
                    self.list_tasks()
                elif choice == 3:
                    self.update_task()
                elif choice == 4:
                    self.delete_task()
                elif choice == 5:
                    self.complete_task()
                elif choice == 6:
                    print("\nThank you for using the Todo Application. Goodbye!")
                    break
                else:
                    display_error("Invalid choice. Please select a number between 1 and 6.")

            except KeyboardInterrupt:
                print("\n\nApplication interrupted. Exiting...")
                break
            except Exception as e:
                display_error(f"An unexpected error occurred: {str(e)}")
                print("Please try again or contact support if the problem persists.")


def main():
    """Entry point for the application."""
    app = TodoApp()
    app.run()


if __name__ == "__main__":
    main()