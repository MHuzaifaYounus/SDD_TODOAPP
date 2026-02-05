
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { dbService } from "./dbService.ts";
import { Priority, Recurrence, Task } from "../types.ts";

export class GeminiService {
  private getToolDefinitions(): FunctionDeclaration[] {
    return [
      {
        name: 'add_task',
        description: 'Create a new todo task for the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'The objective of the task' },
            description: { type: Type.STRING, description: 'Detailed context for the task' },
            priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'Urgency level' },
            dueDate: { type: Type.STRING, description: 'ISO format date string for when it is due' }
          },
          required: ['title']
        }
      },
      {
        name: 'list_tasks',
        description: 'List the current tasks for the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['all', 'active', 'completed'], description: 'Filter tasks by status' }
          }
        }
      },
      {
        name: 'complete_task',
        description: 'Mark a specific task as completed.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            taskIdentifier: { type: Type.STRING, description: 'The unique ID or the exact Title of the task to complete' }
          },
          required: ['taskIdentifier']
        }
      },
      {
        name: 'update_task',
        description: 'Modify an existing task details.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            taskIdentifier: { type: Type.STRING, description: 'The unique ID or Title of the task to update' },
            title: { type: Type.STRING, description: 'New title' },
            description: { type: Type.STRING, description: 'New description' },
            priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'New priority level' }
          },
          required: ['taskIdentifier']
        }
      },
      {
        name: 'delete_task',
        description: 'Remove a specific task from the list.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            taskIdentifier: { type: Type.STRING, description: 'The unique ID or the exact Title of the task to delete' }
          },
          required: ['taskIdentifier']
        }
      }
    ];
  }

  async chatWithAgent(
    userId: string, 
    conversationId: string, 
    userMessage: string, 
    history: {role: string, parts: {text: string}[]}[],
    onToolExecuted?: () => void
  ) {
    // ALWAYS initialize fresh to ensure correct API key handling
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const tools = this.getToolDefinitions();
    
    // Save user message to DB
    await dbService.saveMessage(conversationId, 'user', userMessage);

    const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          tools: [{ functionDeclarations: tools }],
          systemInstruction: "You are NovaAssistant, a productivity manager. You must use tools for all task-related actions. If you cannot find a task by the user's provided name, list the tasks first. Confirm actions clearly."
        }
      });

      if (!response.candidates?.[0]) {
        throw new Error("No response from AI model.");
      }

      const modelTurn = response.candidates[0].content;
      let finalContent = response.text || "";
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const toolResults = [];
        const executionSummaries: string[] = [];

        for (const call of response.functionCalls) {
          let result = "Error: Tool execution failed.";
          const args = call.args as any;

          try {
            const currentTasks = await dbService.getTasks(userId);

            if (call.name === 'add_task') {
              const task: Task = {
                id: Math.random().toString(36).substr(2, 9),
                title: args.title,
                description: args.description || '',
                priority: (args.priority as Priority) || Priority.MEDIUM,
                isCompleted: false,
                tags: [],
                dueDate: args.dueDate || null,
                reminderTime: null,
                recurrence: Recurrence.NONE,
                createdAt: new Date().toISOString()
              };
              await dbService.saveTask(userId, task);
              result = `SUCCESS: Created task "${task.title}"`;
            } 
            else if (call.name === 'list_tasks') {
              const filtered = args.status === 'active' ? currentTasks.filter(t => !t.isCompleted) :
                               args.status === 'completed' ? currentTasks.filter(t => t.isCompleted) : currentTasks;
              result = `SUCCESS: Found tasks: ${JSON.stringify(filtered.map(t => ({ id: t.id, title: t.title })))}`;
            } 
            else if (call.name === 'complete_task' || call.name === 'delete_task' || call.name === 'update_task') {
              const iden = args.taskIdentifier?.toLowerCase();
              const task = currentTasks.find(t => 
                t.id === iden || 
                t.title.toLowerCase() === iden || 
                t.title.toLowerCase().includes(iden)
              );
              
              if (!task) {
                result = `FAILURE: Task "${args.taskIdentifier}" not found.`;
              } else {
                if (call.name === 'complete_task') {
                  task.isCompleted = true;
                  await dbService.saveTask(userId, task);
                  result = `SUCCESS: Completed "${task.title}"`;
                } else if (call.name === 'delete_task') {
                  await dbService.deleteTask(userId, task.id);
                  result = `SUCCESS: Deleted "${task.title}"`;
                } else if (call.name === 'update_task') {
                  if (args.title) task.title = args.title;
                  if (args.priority) task.priority = args.priority as Priority;
                  await dbService.saveTask(userId, task);
                  result = `SUCCESS: Updated "${task.title}"`;
                }
              }
            }
          } catch (e) {
            result = `ERROR: ${e instanceof Error ? e.message : 'Unknown error'}`;
          }

          executionSummaries.push(result);
          toolResults.push({
            functionResponse: {
              name: call.name,
              response: { result }
            }
          });
        }

        if (onToolExecuted) onToolExecuted();

        const secondResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            ...contents,
            modelTurn,
            { role: 'function', parts: toolResults }
          ],
          config: { 
            systemInstruction: "You are NovaAssistant. Report the exact status of the tools used. If a tool reported FAILURE or ERROR, explain the reason clearly to the user."
          }
        });
        
        finalContent = secondResponse.text || executionSummaries.join('. ');
      }

      await dbService.saveMessage(conversationId, 'model', finalContent);
      return { content: finalContent, toolUsed: !!response.functionCalls?.length };

    } catch (error) {
      console.error("Gemini AI communication failure:", error);
      const errorMessage = error instanceof Error ? error.message : "Internal AI engine failure.";
      await dbService.saveMessage(conversationId, 'model', `Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  async suggestSubtasks(taskTitle: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Task: "${taskTitle}". Suggest 3 actionable subtasks in JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["subtasks"]
          }
        }
      });
      const data = JSON.parse(response.text || '{"subtasks": []}');
      return data.subtasks as string[];
    } catch (error) { return []; }
  }

  async suggestTags(taskTitle: string, taskDescription: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 3 tags for: "${taskTitle}". Return JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(response.text || '[]') as string[];
    } catch (error) { return []; }
  }
}

export const geminiService = new GeminiService();
