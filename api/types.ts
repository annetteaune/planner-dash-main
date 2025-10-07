export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password_hash: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  password_hash?: string;
}

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  due_at: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  user_id: string;
  text: string;
  due_at?: string | null;
  priority?: number;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  address: string | null;
  start_at: string | null;
  end_at: string | null;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  user_id: string;
  title: string;
  content?: string | null;
  address?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  all_day?: boolean;
}

export interface UpdateEventRequest {
  id: string;
  title?: string;
  content?: string | null;
  address?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  all_day?: boolean;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess<T = any> {
  data?: T;
  message?: string;
}
