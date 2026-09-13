export interface GraphNode {
  id: string;
  label: string;
  file_path: string;
  file_type: string;
  size: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ArchitectureGraphResponse {
  repository_id: string;
  total_nodes: number;
  total_edges: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SecurityFinding {
  file_path: string;
  line_number: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | string;
  category: string;
  description: string;
  snippet: string;
}

export interface FileComplexity {
  file_path: string;
  lines_of_code: number;
  complexity_score: number;
  rating: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export interface QualityInsightsResponse {
  repository_id: string;
  health_score: number;
  total_lines_of_code: number;
  total_decision_points: number;
  critical_issues: number;
  warning_issues: number;
  security_findings: SecurityFinding[];
  file_complexity_metrics: FileComplexity[];
}
