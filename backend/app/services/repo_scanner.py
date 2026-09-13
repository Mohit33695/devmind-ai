import os
import io
import shutil
import zipfile
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from fastapi import UploadFile, HTTPException, status

# Security limits
MAX_TOTAL_EXTRACT_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB max total repo size
MAX_SINGLE_FILE_SIZE_BYTES = 2 * 1024 * 1024      # 2 MB max per file
ALLOWED_TEXT_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json", ".md",
    ".txt", ".yaml", ".yml", ".toml", ".sh", ".c", ".cpp", ".h", ".hpp",
    ".java", ".go", ".rs", ".sql", ".dockerfile", ".env", ".example", ".xml"
}

IGNORED_DIRS = {
    ".git", "__pycache__", "node_modules", "venv", ".venv", "env",
    "dist", "build", ".next", ".idea", ".vscode", "coverage", ".pytest_cache"
}

IGNORED_FILES = {
    ".ds_store", "thumbs.db", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"
}


def is_binary_file(filepath: Path) -> bool:
    """
    Heuristic check to detect binary files by scanning the first 1024 bytes for null bytes.
    """
    try:
        with open(filepath, "rb") as f:
            chunk = f.read(1024)
            if b"\x00" in chunk:
                return True
    except Exception:
        return True
    return False


def is_ignored(path: Path, root_path: Path) -> bool:
    """
    Determines if a given path should be skipped (build artifacts, node_modules, binaries, git metadata).
    """
    relative_parts = path.relative_to(root_path).parts
    for part in relative_parts:
        if part.lower() in IGNORED_DIRS:
            return True

    if path.is_file():
        if path.name.lower() in IGNORED_FILES:
            return True
        if path.suffix.lower() not in ALLOWED_TEXT_EXTENSIONS and path.suffix != "":
            return True
        if is_binary_file(path):
            return True

    return False


def safe_extract_zip(zip_bytes: bytes, target_dir: Path) -> List[Path]:
    """
    Safely extracts a ZIP archive into target_dir with path-traversal and zip-bomb protection.
    """
    target_dir = target_dir.resolve()
    target_dir.mkdir(parents=True, exist_ok=True)

    extracted_files: List[Path] = []
    total_extracted_size = 0

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        for member in zf.infolist():
            # Security Check 1: Path Traversal prevention
            member_path = (target_dir / member.filename).resolve()
            try:
                member_path.relative_to(target_dir)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Security alert: Malicious zip entry '{member.filename}' detected (Path Traversal attempt)."
                )

            # Security Check 2: ZIP Bomb protection
            total_extracted_size += member.file_size
            if total_extracted_size > MAX_TOTAL_EXTRACT_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Security alert: Repository exceeds total allowable size limit of {MAX_TOTAL_EXTRACT_SIZE_BYTES / (1024*1024)} MB."
                )

            if member.is_dir():
                member_path.mkdir(parents=True, exist_ok=True)
            else:
                member_path.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(member) as source, open(member_path, "wb") as target:
                    shutil.copyfileobj(source, target)
                extracted_files.append(member_path)

    return extracted_files


def clone_github_repo(repo_url: str, target_dir: Path) -> Path:
    """
    Clones a public GitHub repository using shallow clone (--depth 1) for speed and security.
    """
    target_dir = target_dir.resolve()
    if target_dir.exists():
        shutil.rmtree(target_dir, ignore_errors=True)

    target_dir.mkdir(parents=True, exist_ok=True)

    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, str(target_dir)],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=60
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to clone GitHub repository: {e.stderr.strip() or str(e)}"
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="GitHub clone operation timed out after 60 seconds."
        )

    return target_dir


def scan_repository_tree(root_dir: Path) -> Tuple[Dict[str, Any], List[Dict[str, Any]], int]:
    """
    Scans a directory tree recursively and builds a hierarchical JSON file tree structure
    along with a flattened list of scanned code files for database storage.
    """
    root_dir = root_dir.resolve()

    scanned_code_files: List[Dict[str, Any]] = []
    total_files_count = 0

    def build_tree(current_dir: Path) -> Dict[str, Any]:
        nonlocal total_files_count
        name = current_dir.name or root_dir.name
        children = []

        try:
            entries = sorted(list(current_dir.iterdir()), key=lambda x: (not x.is_dir(), x.name.lower()))
        except PermissionError:
            return {"name": name, "type": "directory", "children": []}

        for entry in entries:
            if is_ignored(entry, root_dir):
                continue

            if entry.is_dir():
                child_tree = build_tree(entry)
                if child_tree.get("children"):  # Only include non-empty folders
                    children.append(child_tree)
            elif entry.is_file():
                rel_path = str(entry.relative_to(root_dir)).replace("\\", "/")
                file_size = entry.stat().st_size

                if file_size <= MAX_SINGLE_FILE_SIZE_BYTES:
                    total_files_count += 1
                    file_ext = entry.suffix.lstrip(".").lower() or "text"
                    
                    scanned_code_files.append({
                        "file_path": rel_path,
                        "file_type": file_ext,
                        "size_bytes": file_size,
                    })

                    children.append({
                        "name": entry.name,
                        "type": "file",
                        "path": rel_path,
                        "size": file_size,
                        "extension": file_ext,
                    })

        return {
            "name": name,
            "type": "directory",
            "children": children
        }

    tree_structure = build_tree(root_dir)
    return tree_structure, scanned_code_files, total_files_count
