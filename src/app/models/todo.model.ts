export interface Todo {
  id: string;
  user_id?: string;
  text: string;
  completed: boolean;
  due_at?: string | null;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}
