export interface RepositorySummary {
  id: string;
  name: string;
  status: string;
  total_files: number;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  repository_count: number;
  repositories: RepositorySummary[];
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
}

export interface ProjectListResponse {
  total: number;
  projects: Project[];
}
