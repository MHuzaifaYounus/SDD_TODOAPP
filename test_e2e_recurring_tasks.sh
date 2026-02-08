#!/bin/bash
set -e

echo "--- End-to-end Test: Dapr Jobs API and Recurring Task Spawning ---"

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

# --- Schedule a Recurring Task via Backend API ---
echo "4. Schedule a recurring task using the Backend API, which creates a Dapr Job."
DAPR_HTTP_PORT_BACKEND=3500 # This is the backend's dapr http port
TASK_ID_RECURRING=$(uuidgen)
TASK_TITLE_RECURRING="Daily Standup Task"
# Schedule to trigger 1 minute from now for testing purposes
SCHEDULE_TIME=$(date -u -v+1M +"%Y-%m-%dT%H:%M:%SZ") # macOS date format, adjust for Linux if needed: date -u -d "+1 minute" +"%Y-%m-%dT%H:%M:%SZ"

echo "   Calling Backend to schedule a recurring task Dapr Job (scheduled for 1 minute from now):"
curl -X POST http://localhost:8000/schedule-reminder 
  -H "Content-Type: application/json" 
  -d "{ "id": "$TASK_ID_RECURRING", "title": "$TASK_TITLE_RECURRING", "reminderTime": "$SCHEDULE_TIME" }"
echo ""
echo "   Wait for approximately 1 minute for the Dapr Job to trigger and call the Worker."
echo "   You should see logs in the Worker like 'Received recurring task trigger...'"
echo ""

# --- Simulate Backend sending 'recurring-task' event (if implemented) ---
# This part would be if the Dapr Job triggers the backend, which then publishes to 'recurring-task' topic.
# As currently implemented, the job scheduler triggers the /reminders endpoint.
# For recurring tasks, the Dapr job could be configured to directly trigger the /recurring-task endpoint on the worker.
# This test focuses on the Dapr Job triggering *some* worker endpoint.

echo "--- Test Complete ---"
echo "Manually verify worker logs for 'Received recurring task trigger' after the scheduled time."
echo "You might need to wait for the scheduled time to pass."
