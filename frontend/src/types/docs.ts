export interface ReadmeResponse {
  repository_id: string;
  repository_name: string;
  readme_markdown: string;
  tech_stack: Record<string, string[]>;
}
