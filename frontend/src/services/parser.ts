import type { ParseRepositorySummary, SymbolListResponse } from '../types/parser';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function parseRepositoryAST(repositoryId: string): Promise<ParseRepositorySummary> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/parse`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to parse AST code symbols');
  }

  return await response.json();
}

export async function fetchRepositorySymbols(
  repositoryId: string,
  symbolType?: string,
  query?: string
): Promise<SymbolListResponse> {
  const params = new URLSearchParams();
  if (symbolType) params.append('symbol_type', symbolType);
  if (query) params.append('query', query);

  const url = `${API_BASE_URL}/repositories/${repositoryId}/symbols?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch repository code symbols');
  }

  return await response.json();
}
