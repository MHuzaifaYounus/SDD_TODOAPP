
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Recurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  tags: string[];
  dueDate: string | null; // ISO String
  reminderTime: string | null; // ISO String
  recurrence: Recurrence;
  createdAt: string;
}

export type ViewState = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'DASHBOARD';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}
