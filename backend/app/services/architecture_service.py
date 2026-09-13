import re
from pathlib import Path
from typing import List, Dict, Any


SECRET_PATTERNS = [
    (re.compile(r'(?i)(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|password)\s*=\s*[\'"][^\'"]{6,}[\'"]'), "Hardcoded Secret / API Key"),
    (re.compile(r'AKIA[0-9A-Z]{16}'), "AWS Access Key ID"),
    (re.compile(r'ghp_[a-zA-Z0-9]{36}'), "GitHub Personal Access Token"),
    (re.compile(r'sk-[a-zA-Z0-9]{32,}'), "OpenAI / LLM API Key"),
]

UNSAFE_CALL_PATTERNS = [
    (re.compile(r'\beval\s*\('), "Unsafe eval() execution"),
    (re.compile(r'\bexec\s*\('), "Unsafe exec() execution"),
    (re.compile(r'shell\s*=\s*True'), "Subprocess execution with shell=True"),
    (re.compile(r'os\.system\s*\('), "Unsafe os.system() execution"),
]


def build_dependency_graph(
    scanned_files: List[Dict[str, Any]],
    ast_symbols: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Constructs a Directed Acyclic Graph (DAG) of project modules and their import dependencies.
    """
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    node_ids = set()

    # Create Nodes for each code file
    for f in scanned_files:
        path = f["file_path"]
        name = Path(path).name
        node_id = path.replace("\\", "/")
        node_ids.add(node_id)

        nodes.append({
            "id": node_id,
            "label": name,
            "file_path": path,
            "file_type": f.get("file_type", "text"),
            "size": f.get("size_bytes", 0),
        })

    # Create Edges based on import symbols
    import_symbols = [s for s in ast_symbols if s.get("symbol_type") == "import"]
    seen_edges = set()

    for imp in import_symbols:
        source_path = imp.get("file_path", "")
        target_name = imp.get("name", "")

        if not source_path or not target_name:
            continue

        source_id = source_path.replace("\\", "/")

        # Match import target against scanned file nodes
        for target_id in node_ids:
            if target_id == source_id:
                continue

            target_stem = Path(target_id).stem.lower()
            import_stem = target_name.split(".")[-1].lower()

            if target_stem == import_stem or target_id.lower().endswith(target_name.lower()):
                edge_key = f"{source_id}->{target_id}"
                if edge_key not in seen_edges:
                    seen_edges.add(edge_key)
                    edges.append({
                        "id": edge_key,
                        "source": source_id,
                        "target": target_id,
                        "label": f"imports {target_name}",
                    })

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
    }


def analyze_code_quality_and_security(
    repo_dir: Path,
    scanned_files: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Performs static analysis for code complexity, security vulnerabilities, and quality heuristics.
    """
    security_findings: List[Dict[str, Any]] = []
    file_complexity_metrics: List[Dict[str, Any]] = []
    total_lines_of_code = 0
    total_decision_points = 0

    for f_info in scanned_files:
        rel_path = f_info["file_path"]
        full_path = repo_dir / rel_path

        if not full_path.exists() or not full_path.is_file():
            continue

        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
        except Exception:
            continue

        loc = len(lines)
        total_lines_of_code += loc
        file_decision_points = 0

        for line_num, line in enumerate(lines, start=1):
            stripped = line.strip()

            # Cyclomatic Complexity decision points (if, elif, else, for, while, try, except)
            if re.search(r'\b(if|elif|for|while|try|except|case)\b', stripped):
                file_decision_points += 1
                total_decision_points += 1

            # Check Hardcoded Secrets
            for pattern, desc in SECRET_PATTERNS:
                if pattern.search(stripped):
                    security_findings.append({
                        "file_path": rel_path,
                        "line_number": line_num,
                        "severity": "CRITICAL",
                        "category": "Hardcoded Secret",
                        "description": f"{desc} detected on line {line_num}.",
                        "snippet": stripped[:100],
                    })

            # Check Unsafe Calls
            for pattern, desc in UNSAFE_CALL_PATTERNS:
                if pattern.search(stripped):
                    security_findings.append({
                        "file_path": rel_path,
                        "line_number": line_num,
                        "severity": "WARNING",
                        "category": "Security Violation",
                        "description": f"{desc} detected on line {line_num}.",
                        "snippet": stripped[:100],
                    })

        # Calculate estimated cyclomatic complexity score
        complexity_score = 1 + file_decision_points
        file_complexity_metrics.append({
            "file_path": rel_path,
            "lines_of_code": loc,
            "complexity_score": complexity_score,
            "rating": "HIGH" if complexity_score > 15 else "MEDIUM" if complexity_score > 7 else "LOW"
        })

    # Calculate Overall Health Score (100 base, deductions for critical/warning findings)
    critical_count = sum(1 for item in security_findings if item["severity"] == "CRITICAL")
    warning_count = sum(1 for item in security_findings if item["severity"] == "WARNING")

    health_score = max(0, 100 - (critical_count * 15) - (warning_count * 5))

    return {
        "health_score": health_score,
        "total_lines_of_code": total_lines_of_code,
        "total_decision_points": total_decision_points,
        "critical_issues": critical_count,
        "warning_issues": warning_count,
        "security_findings": security_findings,
        "file_complexity_metrics": sorted(file_complexity_metrics, key=lambda x: x["complexity_score"], reverse=True),
    }
