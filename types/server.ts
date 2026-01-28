export interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  private_key: string | null;
  auth_method: 'password' | 'private_key';
  primary_tag: string | null;
  tags: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}
