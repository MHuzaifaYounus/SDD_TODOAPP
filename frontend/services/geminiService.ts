import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private getClient() {
    const apiKey = (window as any).process?.env?.API_KEY || '';
    return new GoogleGenAI({ apiKey });
  }

  async suggestSubtasks(taskTitle: string) {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Task: "${taskTitle}". Suggest 3-5 very brief, actionable atomic subtasks in JSON.`,
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
      console.error("Gemini breakdown failed:", error);
      return [];
    }
  }

  async suggestTags(taskTitle: string, taskDescription: string) {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 3 professional short tags for: "${taskTitle}" - "${taskDescription}". Return JSON array of strings.`,
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
      console.error("Gemini tagging failed:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();