import type { ReadmeResponse } from '../types/docs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function generateReadmeDocumentation(repositoryId: string): Promise<ReadmeResponse> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/generate-readme`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate README documentation');
  }

  return await response.json();
}
