export interface Event {
  id: string;
  user_id: string;
  title: string;
  content: string;
  address: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  created_at?: string;
  updated_at?: string;
}
