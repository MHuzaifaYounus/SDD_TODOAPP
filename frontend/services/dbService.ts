
import { neon } from '@neondatabase/serverless';
import { User, Task } from '../types';

const DATABASE_URL = 'postgresql://neondb_owner:npg_wHSG3sozJLY8@ep-small-wind-ah8z6ugj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

export class DbService {
  async init() {
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
      console.log('Database initialized');
    } catch (err) {
      console.error('Failed to init DB', err);
    }
  }

  async getUserByEmail(email: string) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  }

  async createUser(user: User & { password?: string }) {
    await sql`
      INSERT INTO users (id, email, name, password)
      VALUES (${user.id}, ${user.email}, ${user.name}, ${user.password || ''})
    `;
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
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
  }

  async saveTask(userId: string, task: Task) {
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
  }

  async deleteTask(id: string) {
    await sql`DELETE FROM tasks WHERE id = ${id}`;
  }
}

export const dbService = new DbService();
