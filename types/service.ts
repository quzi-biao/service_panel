export interface Service {
  id: number;
  name: string;
  url: string;
  username: string | null;
  password: string | null;
  description: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceInput {
  name: string;
  url: string;
  username?: string;
  password?: string;
  description?: string;
}
