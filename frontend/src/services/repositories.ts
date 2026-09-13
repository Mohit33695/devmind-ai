import type { Repository, FileTreeResponse, FileContentResponse } from '../types/repository';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchProjectRepositories(projectId: string): Promise<Repository[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/repositories`);
  if (!response.ok) {
    throw new Error('Failed to fetch project repositories');
  }
  return await response.json();
}

export async function uploadZipRepository(projectId: string, file: File, name?: string): Promise<Repository> {
  const formData = new FormData();
  formData.append('file', file);
  if (name) {
    formData.append('repo_name', name);
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/repositories/upload-zip`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload ZIP repository');
  }

  return await response.json();
}

export async function cloneGitHubRepository(projectId: string, repoUrl: string, name?: string): Promise<Repository> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/repositories/clone-github`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repo_url: repoUrl, name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to clone GitHub repository');
  }

  return await response.json();
}

export async function fetchFileTree(repositoryId: string): Promise<FileTreeResponse> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/file-tree`);
  if (!response.ok) {
    throw new Error('Failed to fetch file tree');
  }
  return await response.json();
}

export async function fetchFileContent(repositoryId: string, filePath: string): Promise<FileContentResponse> {
  const response = await fetch(
    `${API_BASE_URL}/repositories/${repositoryId}/file-content?file_path=${encodeURIComponent(filePath)}`
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch file content');
  }
  return await response.json();
}

export async function deleteRepository(repositoryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete repository');
  }
}
