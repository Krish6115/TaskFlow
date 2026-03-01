/**
 * TypeScript interfaces for the To-Do App.
 * Mirrors the backend MongoDB models and API response shapes.
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: Priority;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: User;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dateTime?: string;
  deadline: string;
  priority?: Priority;
  category?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dateTime?: string;
  deadline?: string;
  priority?: Priority;
  category?: string;
  completed?: boolean;
}

export interface TaskQueryParams {
  sortBy?: 'priority' | 'deadline' | 'dateTime' | 'mixed';
  filterCategory?: string;
  filterCompleted?: string;
  filterPriority?: Priority;
}
