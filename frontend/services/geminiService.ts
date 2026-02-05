
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async suggestSubtasks(taskTitle: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I have a task called "${taskTitle}". Suggest 3-5 brief actionable subtasks in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["subtasks"]
          }
        }
      });
      
      const data = JSON.parse(response.text || '{"subtasks": []}');
      return data.subtasks as string[];
    } catch (error) {
      console.error("Gemini suggestion failed:", error);
      return [];
    }
  }

  async suggestTags(taskTitle: string, taskDescription: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 3 relevant short tags for this task: "${taskTitle}" - "${taskDescription}". Return as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]') as string[];
    } catch (error) {
      console.error("Gemini tag suggestion failed:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
