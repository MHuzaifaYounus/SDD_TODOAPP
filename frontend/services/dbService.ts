
import { neon } from '@neondatabase/serverless';
import { User, Task, Conversation, Message } from '../types.ts';

const STORAGE_KEYS = {
  USERS: 'novatask_fallback_users',
  TASKS: 'novatask_fallback_tasks',
  CONVERSATIONS: 'novatask_fallback_convs',
  MESSAGES: 'novatask_fallback_msgs'
};

export class DbService {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private sqlClient: any = null;

  private get sql() {
    if (this.sqlClient) return this.sqlClient;
    const url = (window as any).process?.env?.DATABASE_URL;
    if (url) {
      this.sqlClient = neon(url);
      return this.sqlClient;
    }
    return null;
  }

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const sql = this.sql;
      if (!sql) {
        this.isInitialized = true;
        return;
      }
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            is_completed BOOLEAN DEFAULT FALSE,
            priority TEXT NOT NULL,
            tags TEXT[] DEFAULT '{}',
            due_date TEXT,
            reminder_time TEXT,
            recurrence TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            title TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;
        this.isInitialized = true;
      } catch (err) {
        console.warn('DB init failure:', err);
        this.isInitialized = true;
      }
    })();
    return this.initPromise;
  }

  // Task Operations
  async getTasks(userId: string): Promise<Task[]> {
    await this.init();
    if (this.sql) {
      try {
        const rows = await this.sql`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY created_at DESC`;
        return rows.map(row => ({
          id: row.id, title: row.title, description: row.description || '',
          isCompleted: row.is_completed, priority: row.priority as any,
          tags: row.tags || [], dueDate: row.due_date, reminderTime: row.reminder_time,
          recurrence: row.recurrence as any, createdAt: row.created_at
        }));
      } catch (e) { console.error(e); }
    }
    return JSON.parse(localStorage.getItem(`${STORAGE_KEYS.TASKS}_${userId}`) || '[]');
  }

  async saveTask(userId: string, task: Task) {
    await this.init();
    const tasks = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.TASKS}_${userId}`) || '[]');
    const idx = tasks.findIndex((t: any) => t.id === task.id);
    if (idx > -1) tasks[idx] = task; else tasks.push(task);
    localStorage.setItem(`${STORAGE_KEYS.TASKS}_${userId}`, JSON.stringify(tasks));

    if (this.sql) {
      try {
        await this.sql`
          INSERT INTO tasks (id, user_id, title, description, is_completed, priority, tags, due_date, reminder_time, recurrence, created_at)
          VALUES (${task.id}, ${userId}, ${task.title}, ${task.description}, ${task.isCompleted}, ${task.priority}, ${task.tags}, ${task.dueDate}, ${task.reminderTime}, ${task.recurrence}, ${task.createdAt})
          ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, is_completed=EXCLUDED.is_completed, priority=EXCLUDED.priority, tags=EXCLUDED.tags, due_date=EXCLUDED.due_date, reminder_time=EXCLUDED.reminder_time, recurrence=EXCLUDED.recurrence
        `;
      } catch (e) { console.error(e); }
    }
  }

  async deleteTask(userId: string, id: string): Promise<boolean> {
    await this.init();
    const tasks = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.TASKS}_${userId}`) || '[]');
    const initialLength = tasks.length;
    const filtered = tasks.filter((t: any) => t.id !== id);
    const wasDeletedInLocalStorage = filtered.length < initialLength;
    localStorage.setItem(`${STORAGE_KEYS.TASKS}_${userId}`, JSON.stringify(filtered));

    let wasDeletedInSql = false;
    if (this.sql) {
      try {
        const result = await this.sql`DELETE FROM tasks WHERE id = ${id}`;
        // In some SQL drivers, result might contain count. For now we rely on the find check in the service turn.
        wasDeletedInSql = true; 
      } catch (e) { console.error(e); }
    }
    
    // We consider it a success if it was removed from at least the local storage or if SQL command executed.
    // However, the service layer double-checks existence first.
    return wasDeletedInLocalStorage || (this.sql !== null && wasDeletedInSql);
  }

  // User Operations
  async getUserByEmail(email: string) {
    await this.init();
    if (this.sql) {
      const res = await this.sql`SELECT * FROM users WHERE email = ${email}`;
      if (res[0]) return res[0];
    }
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.find((u: any) => u.email === email) || null;
  }

  async createUser(user: User & { password?: string }) {
    await this.init();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (this.sql) await this.sql`INSERT INTO users (id, email, name, password) VALUES (${user.id}, ${user.email}, ${user.name}, ${user.password || ''})`;
    return user;
  }

  // Chat Operations
  async getConversations(userId: string): Promise<Conversation[]> {
    await this.init();
    if (this.sql) {
      const rows = await this.sql`SELECT * FROM conversations WHERE user_id = ${userId} ORDER BY created_at DESC`;
      return rows.map(r => ({ id: r.id, userId: r.user_id, title: r.title, createdAt: r.created_at }));
    }
    return JSON.parse(localStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`) || '[]');
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    await this.init();
    const conv = { id: Math.random().toString(36).substr(2, 9), userId, title, createdAt: new Date().toISOString() };
    const convs = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`) || '[]');
    convs.unshift(conv);
    localStorage.setItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`, JSON.stringify(convs));
    if (this.sql) await this.sql`INSERT INTO conversations (id, user_id, title) VALUES (${conv.id}, ${userId}, ${title})`;
    return conv;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await this.init();
    if (this.sql) {
      const rows = await this.sql`SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC`;
      return rows.map(r => ({ id: r.id, conversationId: r.conversation_id, role: r.role as any, content: r.content, createdAt: r.created_at }));
    }
    return JSON.parse(localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`) || '[]');
  }

  async saveMessage(conversationId: string, role: 'user' | 'model', content: string) {
    await this.init();
    const msg = { id: Math.random().toString(36).substr(2, 9), conversationId, role, content, createdAt: new Date().toISOString() };
    const msgs = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`) || '[]');
    msgs.push(msg);
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`, JSON.stringify(msgs));
    if (this.sql) await this.sql`INSERT INTO messages (id, conversation_id, role, content) VALUES (${msg.id}, ${conversationId}, ${role}, ${content})`;
    return msg;
  }
}

export const dbService = new DbService();
