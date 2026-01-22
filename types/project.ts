export interface ProjectMiddleware {
  id?: number;
  project_id?: number;
  middleware_name: string;
  middleware_config?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectResource {
  id?: number;
  project_id?: number;
  resource_name: string;
  resource_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectPrompt {
  id?: number;
  project_id?: number;
  prompt_content: string;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  project_type: string;
  description: string | null;
  project_url: string | null;
  dev_device_name: string | null;
  dev_device_path: string | null;
  deploy_server: string | null;
  service_urls: string | null;
  extended_info: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  middleware?: ProjectMiddleware[];
  resources?: ProjectResource[];
  prompts?: ProjectPrompt[];
}

export interface ProjectBasicInput {
  name: string;
  project_type: string;
  description?: string;
  project_url?: string;
  dev_device_name?: string;
  dev_device_path?: string;
  deploy_server?: string;
  service_urls?: string[];
}

export interface ProjectCreateInput {
  name: string;
  project_type: string;
  description?: string;
  project_url?: string;
}

export interface ProjectExtendedInput {
  extended_info?: string;
  middleware?: Array<{
    middleware_name: string;
    middleware_config?: string;
  }>;
  resources?: Array<{
    resource_name: string;
    resource_description?: string;
  }>;
}
