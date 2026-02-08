import logging
import sys
from fastapi import FastAPI, Body
from pydantic import BaseModel

# Standard logging is safer for the hackathon
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("worker")

app = FastAPI()

@app.get("/dapr/subscribe")
def subscribe():
    # MUST match the name in your dapr/components/pubsub.yaml
    PUBSUB_NAME = "task-pubsub" 
    
    subscriptions = [
        {
            "pubsubname": PUBSUB_NAME,
            "topic": "reminders",
            "route": "/reminders"
        },
        {
            "pubsubname": PUBSUB_NAME,
            "topic": "recurring-task",
            "route": "/recurring-task"
        }
    ]
    return subscriptions

class Reminder(BaseModel):
    taskId: str
    message: str

@app.post("/reminders")
def receive_reminder(reminder: Reminder = Body(...)):
    logger.info(f"RECEIVED REMINDER: Task {reminder.taskId} - {reminder.message}")
    return {"status": "SUCCESS"}

class RecurringTask(BaseModel):
    originalTaskId: str
    nextDueDate: str
    recurrencePattern: str

@app.post("/recurring-task")
def receive_recurring_task(task: RecurringTask = Body(...)):
    logger.info(f"SPAWNING RECURRING TASK from: {task.originalTaskId}")
    return {"status": "SUCCESS"}