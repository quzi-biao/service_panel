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
  network_group: string | null;
  bastion_host: string | null;
  bastion_port: number;
  bastion_username: string | null;
  bastion_password: string | null;
  bastion_private_key: string | null;
  bastion_auth_method: 'password' | 'private_key';
  created_at: string;
  updated_at: string;
}
