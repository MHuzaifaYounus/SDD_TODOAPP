
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { dbService } from "./dbService.ts";
import { Priority, Recurrence, Task } from "../types.ts";

export class GeminiService {
  private getClient() {
    const apiKey = (window as any).process?.env?.API_KEY || '';
    return new GoogleGenAI({ apiKey });
  }

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
    const ai = this.getClient();
    const tools = this.getToolDefinitions();
    
    // Save user message
    await dbService.saveMessage(conversationId, 'user', userMessage);

    const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        tools: [{ functionDeclarations: tools }],
        systemInstruction: "You are NovaAssistant, a productivity manager. You must use tools for all task-related actions (add, delete, complete, update). If a user provides a task name, use it as the taskIdentifier. Do not guess; if you are unsure which task is meant, use list_tasks first. Always be precise."
      }
    });

    let finalContent = response.text || "";
    let toolUsed = false;
    
    if (response.functionCalls && response.functionCalls.length > 0) {
      toolUsed = true;
      const toolResults = [];
      const executionSummaries: string[] = [];

      for (const call of response.functionCalls) {
        let result = "Error: System failed to execute the requested action.";
        const args = call.args as any;

        try {
          // Fetch FRESH tasks for every tool call to avoid stale matching
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
            result = `SUCCESS: Created task "${task.title}" (ID: ${task.id})`;
          } 
          else if (call.name === 'list_tasks') {
            const filtered = args.status === 'active' ? currentTasks.filter(t => !t.isCompleted) :
                             args.status === 'completed' ? currentTasks.filter(t => t.isCompleted) : currentTasks;
            result = `SUCCESS: Found ${filtered.length} tasks. Data: ${JSON.stringify(filtered.map(t => ({ id: t.id, title: t.title, completed: t.isCompleted, priority: t.priority })))}`;
          } 
          else if (call.name === 'complete_task' || call.name === 'delete_task' || call.name === 'update_task') {
            const iden = args.taskIdentifier?.toLowerCase();
            // Search by ID first, then exact Title, then partial Title
            const task = currentTasks.find(t => 
              t.id === iden || 
              t.title.toLowerCase() === iden || 
              t.title.toLowerCase().includes(iden)
            );
            
            if (!task) {
              result = `FAILURE: Task matching identifier "${args.taskIdentifier}" could not be found. Action was aborted. Please check the spelling or list your tasks to see active items.`;
            } else {
              if (call.name === 'complete_task') {
                task.isCompleted = true;
                await dbService.saveTask(userId, task);
                result = `SUCCESS: Marked task "${task.title}" as complete.`;
              } else if (call.name === 'delete_task') {
                const deleted = await dbService.deleteTask(userId, task.id);
                result = deleted ? `SUCCESS: Task "${task.title}" was permanently removed.` : `FAILURE: The task "${task.title}" exists but the database rejected the deletion command.`;
              } else if (call.name === 'update_task') {
                if (args.title) task.title = args.title;
                if (args.description) task.description = args.description;
                if (args.priority) task.priority = args.priority as Priority;
                await dbService.saveTask(userId, task);
                result = `SUCCESS: Updated task "${task.title}" with new parameters.`;
              }
            }
          }
        } catch (e) {
          console.error(`Tool execution error [${call.name}]:`, e);
          result = `FATAL ERROR during ${call.name}: ${e}`;
        }

        executionSummaries.push(result);
        toolResults.push({
          functionResponse: {
            id: call.id,
            name: call.name,
            response: { result }
          }
        });
      }

      // Trigger re-fetch on the dashboard immediately
      if (onToolExecuted) {
        onToolExecuted();
      }

      const secondResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...contents,
          { role: 'model', parts: response.candidates[0].content.parts },
          { role: 'user', parts: toolResults as any }
        ],
        config: { 
          systemInstruction: "You are NovaAssistant. Carefully review the tool results provided. If a result starts with 'FAILURE' or 'ERROR', explain to the user exactly why the action failed (e.g., 'I couldn't find a task named X'). If it starts with 'SUCCESS', confirm the action clearly. DO NOT give generic confirmations if an error occurred. If you cannot generate a response, just repeat the technical error message clearly."
        }
      });
      
      // Fallback to manual summary if model fails to generate one
      finalContent = secondResponse.text || executionSummaries.join('; ');
    }

    await dbService.saveMessage(conversationId, 'model', finalContent);
    return { content: finalContent, toolUsed };
  }

  async suggestSubtasks(taskTitle: string) {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Suggest 3 short tags for: "${taskTitle}". Return JSON array of strings.`,
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
