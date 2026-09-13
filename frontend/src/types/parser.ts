export interface ASTSymbol {
  id: string;
  file_id: string;
  file_path?: string;
  symbol_type: 'function' | 'class' | 'import' | string;
  name: string;
  start_line: number;
  end_line: number;
  signature?: string;
  docstring?: string;
}

export interface ParseRepositorySummary {
  repository_id: string;
  repository_name: string;
  files_parsed: number;
  total_symbols_extracted: number;
}

export interface SymbolListResponse {
  total: number;
  symbols: ASTSymbol[];
}
