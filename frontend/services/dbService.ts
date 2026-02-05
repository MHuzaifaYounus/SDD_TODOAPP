import { neon } from '@neondatabase/serverless';
import { User, Task } from '../types.ts';

// Database connection URL retrieved from environment variables
const DATABASE_URL = process.env.DATABASE_URL || '';
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export class DbService {
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    if (!sql) {
      console.warn('DATABASE_URL is not configured. Database features are currently offline.');
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
      this.isInitialized = true;
      console.log('Database strategy established.');
    } catch (err) {
      console.warn('Persistent storage offline. Falling back to session cache.', err);
      throw err;
    }
  }

  async getUserByEmail(email: string) {
    if (!this.isInitialized || !sql) return null;
    try {
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      return result[0] || null;
    } catch (e) {
      return null;
    }
  }

  async createUser(user: User & { password?: string }) {
    if (!this.isInitialized || !sql) throw new Error("Database not initialized");
    await sql`
      INSERT INTO users (id, email, name, password)
      VALUES (${user.id}, ${user.email}, ${user.name}, ${user.password || ''})
    `;
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    if (!this.isInitialized || !sql) return [];
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
      console.error("Fetch failure", e);
      return [];
    }
  }

  async saveTask(userId: string, task: Task) {
    if (!this.isInitialized || !sql) return;
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
      console.error("Sync error", e);
    }
  }

  async deleteTask(id: string) {
    if (!this.isInitialized || !sql) return;
    try {
      await sql`DELETE FROM tasks WHERE id = ${id}`;
    } catch (e) {
      console.error("Deletion error", e);
    }
  }
}

export const dbService = new DbService();