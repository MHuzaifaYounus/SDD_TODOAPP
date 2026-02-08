#!/bin/bash
set -e

echo "--- End-to-end Test: Dapr Pub/Sub for Reminders ---"

# --- Prerequisites ---
echo "1. Ensure Minikube and Dapr are initialized and components are applied (refer to quickstart.md)."
echo "   minikube start"
echo "   dapr init -k"
echo "   kubectl apply -f dapr/components/"
echo ""

# --- Start Worker Service ---
echo "2. Start the Worker Service with Dapr sidecar in a separate terminal:"
echo "   cd services/worker"
echo "   dapr run --app-id todo-worker --app-port 8001 --dapr-http-port 3502 -- python main.py"
echo "   (Wait for worker to start and subscribe to topics)"
echo ""

# --- Start Backend Service ---
echo "3. Start the Backend Service with Dapr sidecar in another separate terminal:"
echo "   dapr run --app-id todo-backend --app-port 8000 --dapr-http-port 3500 -- python main.py"
echo "   (Wait for backend to start)"
echo ""

# --- Simulate Task Creation/Update from Frontend (which publishes to Dapr) ---
echo "4. Simulate a task creation/update that publishes to 'task-events' topic."
echo "   This would typically come from the Frontend's dbService.ts saveTask method."
echo "   We will manually publish using curl to the Backend's Dapr sidecar (port 3500)."

# Ensure DAPR_HTTP_PORT is the backend's dapr port (3500)
DAPR_HTTP_PORT_BACKEND=3500
TASK_ID=$(uuidgen) # Generate a unique ID for the task
TASK_TITLE="Test Reminder Task"

echo "   Simulating Frontend publishing a 'task-created' event to Backend's Dapr sidecar:"
curl -X POST http://localhost:${DAPR_HTTP_PORT_BACKEND}/v1.0/publish/pubsub-kafka/task-events 
  -H "Content-Type: application/json" 
  -d "{ "type": "task-created", "payload": { "id": "$TASK_ID", "title": "$TASK_TITLE", "description": "This is a reminder test task.", "isCompleted": false, "priority": "high", "tags": [], "dueDate": "2026-03-01T10:00:00Z", "reminderTime": "2026-03-01T09:55:00Z", "isRecurring": false, "recurrencePattern": null, "lastRecurrenceDate": null } }"
echo ""

# --- Verify Reminder Event Processing ---
echo "5. Verify that the Worker Service processed the reminder event."
echo "   (Check the logs of the Worker Service. You should see a log entry like 'Received reminder event...') "
echo "   Note: Actual reminder event from Dapr Jobs API is triggered at reminderTime."
echo "   For this E2E test, we are verifying the *task-events* pub/sub path."
echo ""

echo "--- Test Complete ---"
echo "Manually verify worker logs for 'Received reminder event' and 'Received recurring task trigger' based on your actions."
