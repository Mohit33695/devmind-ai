export interface Repository {
  id: string;
  project_id: string;
  name: string;
  clone_url?: string;
  storage_path?: string;
  status: 'pending' | 'scanning' | 'scanned' | 'error';
  total_files: number;
  created_at: string;
}

export interface FileTreeNode {
  name: string;
  type: 'directory' | 'file';
  path?: string;
  size?: number;
  extension?: string;
  children?: FileTreeNode[];
}

export interface FileTreeResponse {
  repository_id: string;
  repository_name: string;
  total_files: number;
  file_tree: FileTreeNode;
}

export interface FileContentResponse {
  repository_id: string;
  file_path: string;
  content: string;
  size_bytes: number;
  file_type: string;
}
