export interface SourceCitation {
  file_path: string;
  start_line: number;
  end_line: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  message: string;
  sources: SourceCitation[];
  created_at: string;
}

export interface ChatHistoryResponse {
  session_id: string;
  total_messages: number;
  messages: ChatMessage[];
}

export interface IndexRepositoryResponse {
  repository_id: string;
  repository_name: string;
  chunks_indexed: number;
  status: string;
}
