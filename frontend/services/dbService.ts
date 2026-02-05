import { neon } from '@neondatabase/serverless';
import { User, Task } from '../types.ts';

// Storage keys for local fallback
const STORAGE_KEYS = {
  USERS: 'novatask_fallback_users',
  TASKS: 'novatask_fallback_tasks'
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

  private getLocalUsers(): any[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  private saveLocalUser(user: any) {
    const users = this.getLocalUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getLocalTasks(userId: string): Task[] {
    const data = localStorage.getItem(`${STORAGE_KEYS.TASKS}_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private saveLocalTask(userId: string, task: Task) {
    const tasks = this.getLocalTasks(userId);
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(`${STORAGE_KEYS.TASKS}_${userId}`, JSON.stringify(tasks));
  }

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const sql = this.sql;
      if (!sql) {
        console.warn('DATABASE_URL not detected. Using Local Persistence.');
        this.isInitialized = true;
        return;
      }

      try {
        // Create tables if they don't exist
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
        console.log('PostgreSQL persistence layer active.');
        this.isInitialized = true;
      } catch (err) {
        console.warn('Database initialization failed. Falling back to Local Persistence.', err);
        this.isInitialized = true; // Still mark as init so operations don't hang
      }
    })();

    return this.initPromise;
  }

  async getUserByEmail(email: string) {
    await this.init();
    const sql = this.sql;
    
    if (sql) {
      try {
        const result = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (result[0]) return result[0];
      } catch (e) {
        console.error("SQL query failed during getUserByEmail", e);
      }
    }
    
    const localUsers = this.getLocalUsers();
    return localUsers.find(u => u.email === email) || null;
  }

  async createUser(user: User & { password?: string }) {
    await this.init();
    this.saveLocalUser(user);
    const sql = this.sql;

    if (sql) {
      try {
        await sql`
          INSERT INTO users (id, email, name, password)
          VALUES (${user.id}, ${user.email}, ${user.name}, ${user.password || ''})
        `;
      } catch (e) {
        console.error("SQL creation failed during createUser", e);
      }
    }
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    await this.init();
    const sql = this.sql;

    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY created_at DESC
        `;
        return rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description || '',
          isCompleted: row.is_completed,
          priority: row.priority as any,
          tags: row.tags || [],
          dueDate: row.due_date,
          reminderTime: row.reminder_time,
          recurrence: row.recurrence as any,
          createdAt: row.created_at
        }));
      } catch (e) {
        console.error("SQL fetch failed during getTasks", e);
      }
    }

    return this.getLocalTasks(userId);
  }

  async saveTask(userId: string, task: Task) {
    await this.init();
    this.saveLocalTask(userId, task);
    const sql = this.sql;

    if (sql) {
      try {
        await sql`
          INSERT INTO tasks (id, user_id, title, description, is_completed, priority, tags, due_date, reminder_time, recurrence, created_at)
          VALUES (
            ${task.id}, ${userId}, ${task.title}, ${task.description}, 
            ${task.isCompleted}, ${task.priority}, ${task.tags}, 
            ${task.dueDate}, ${task.reminderTime}, ${task.recurrence}, ${task.createdAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            is_completed = EXCLUDED.is_completed,
            priority = EXCLUDED.priority,
            tags = EXCLUDED.tags,
            due_date = EXCLUDED.due_date,
            reminder_time = EXCLUDED.reminder_time,
            recurrence = EXCLUDED.recurrence
        `;
      } catch (e) {
        console.error("SQL sync failed during saveTask", e);
      }
    }
  }

  async deleteTask(id: string) {
    await this.init();
    // Simple local deletion attempt
    const allLocalKeys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEYS.TASKS));
    allLocalKeys.forEach(key => {
      try {
        const tasks = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = tasks.filter((t: any) => t.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (e) {}
    });

    const sql = this.sql;
    if (sql) {
      try {
        await sql`DELETE FROM tasks WHERE id = ${id}`;
      } catch (e) {
        console.error("SQL deletion failed", e);
      }
    }
  }
}

export const dbService = new DbService();