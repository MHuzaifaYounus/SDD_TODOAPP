from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os

app = FastAPI()

DAPR_HOST = os.environ.get("DAPR_HOST", "http://localhost")
DAPR_HTTP_PORT = os.environ.get("DAPR_HTTP_PORT", "3500")

class Task(BaseModel):
    id: str
    title: str
    reminderTime: str

@app.post("/schedule-reminder")
async def schedule_reminder(task: Task):
    job_name = f"reminder-{task.id}"
    schedule_time = task.reminderTime

    # Dapr Jobs API endpoint
    url = f"{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0/jobs/{job_name}?schedule={schedule_time}"

    # The data to be sent when the job is triggered
    job_payload = {
        "data": {
            "taskId": task.id,
            "message": f"Reminder for task: {task.title}"
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(url, json=job_payload)
            response.raise_for_status()
        return {"status": "Reminder scheduled successfully", "job_name": job_name}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Failed to schedule reminder: {e.response.text}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") from e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
