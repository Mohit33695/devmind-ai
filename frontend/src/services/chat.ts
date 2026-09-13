import type { ChatMessage, ChatHistoryResponse, IndexRepositoryResponse } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function indexRepository(repositoryId: string): Promise<IndexRepositoryResponse> {
  const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/index`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to index repository in vector database');
  }

  return await response.json();
}

export async function sendChatMessage(
  projectId: string,
  message: string,
  sessionId?: string
): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to send chat message');
  }

  return await response.json();
}

export async function fetchChatHistory(projectId: string): Promise<ChatHistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat/history`);

  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }

  return await response.json();
}
