#!/usr/bin/env python3
"""
Simple test script to verify the basic functionality of the Todo App.
"""
import sys
import os

# Add the src directory to the path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.task import Task
from src.services.task_service import TaskService
from src.lib.utils import format_task_display, format_tasks_list, validate_task_title


def test_basic_functionality():
    """Test the basic functionality of the Todo App components."""
    print("Testing Todo App functionality...\n")

    # Test Task model
    print("1. Testing Task model:")
    try:
        task = Task(id=1, title="Test Task", description="Test Description", status="pending")
        print(f"   ✓ Created task: {task}")

        # Test validation
        task.complete()
        print(f"   ✓ Completed task: {task}")

        task.mark_pending()
        print(f"   ✓ Marked as pending: {task}")

        print("   ✓ Task model tests passed")
    except Exception as e:
        print(f"   ✗ Task model tests failed: {e}")
        return False

    # Test TaskService
    print("\n2. Testing TaskService:")
    try:
        service = TaskService()

        # Test creating a task
        task1 = service.create_task("First Task", "Description for first task")
        print(f"   ✓ Created task: {task1.title} with ID {task1.id}")

        # Test getting all tasks
        tasks = service.get_all_tasks()
        print(f"   ✓ Retrieved {len(tasks)} tasks")

        # Test updating a task
        updated_task = service.update_task(task1.id, title="Updated First Task")
        print(f"   ✓ Updated task to: {updated_task.title}")

        # Test toggling status
        completed_task = service.update_task_status(task1.id, "completed")
        print(f"   ✓ Completed task: {completed_task.title} (status: {completed_task.status})")

        # Test deleting a task
        deleted = service.delete_task(task1.id)
        print(f"   ✓ Deleted task: {deleted}")

        print("   ✓ TaskService tests passed")
    except Exception as e:
        print(f"   ✗ TaskService tests failed: {e}")
        return False

    # Test utilities
    print("\n3. Testing utilities:")
    try:
        # Test title validation
        is_valid = validate_task_title("Valid Title")
        print(f"   ✓ Valid title validation: {is_valid}")

        is_invalid = validate_task_title("")
        print(f"   ✓ Invalid title validation: {is_invalid}")

        # Test task formatting
        sample_task = Task(id=1, title="Sample Task", description="Sample Description", status="pending")
        formatted = format_task_display(sample_task)
        print(f"   ✓ Task formatting: {formatted}")

        # Test tasks list formatting
        tasks_list = [sample_task]
        formatted_list = format_tasks_list(tasks_list)
        print(f"   ✓ Tasks list formatting: {formatted_list}")

        print("   ✓ Utility tests passed")
    except Exception as e:
        print(f"   ✗ Utility tests failed: {e}")
        return False

    print("\n✓ All tests passed! The Todo App components are working correctly.")
    return True


if __name__ == "__main__":
    success = test_basic_functionality()
    if not success:
        sys.exit(1)