// frontend/services/eventService.ts

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

export class EventService {
  async publish(topic: string, payload: any) {
    const pubsubName = "pubsub-kafka"; // As defined in our Dapr component
    const url = `${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/publish/${pubsubName}/${topic}`;

    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log(`Event published to topic '${topic}'`, payload);
    } catch (error) {
      console.error(`Failed to publish event to topic '${topic}'`, error);
    }
  }
}

export const eventService = new EventService();
