import type { ArchitectureGraphResponse, QualityInsightsResponse } from '../types/architecture';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchArchitectureGraph(repositoryId: string): Promise<ArchitectureGraphResponse> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/architecture-graph`);
  if (!response.ok) {
    throw new Error('Failed to fetch architecture dependency graph');
  }
  return await response.json();
}

export async function fetchQualityInsights(repositoryId: string): Promise<QualityInsightsResponse> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/quality-insights`);
  if (!response.ok) {
    throw new Error('Failed to fetch code quality & security insights');
  }
  return await response.json();
}
