import ast
import re
from pathlib import Path
from typing import List, Dict, Any, Optional


def parse_python_ast(content: str, filename: str = "<unknown>") -> List[Dict[str, Any]]:
    """
    Parses Python source code using Python's native AST module to extract
    functions, classes, methods, imports, signatures, and docstrings.
    """
    symbols: List[Dict[str, Any]] = []

    try:
        tree = ast.parse(content, filename=filename)
    except SyntaxError:
        return symbols

    lines = content.splitlines()

    class SymbolVisitor(ast.NodeVisitor):
        def visit_Import(self, node: ast.Import):
            for alias in node.names:
                symbols.append({
                    "symbol_type": "import",
                    "name": alias.name,
                    "start_line": node.lineno,
                    "end_line": getattr(node, "end_lineno", node.lineno),
                    "signature": f"import {alias.name}" + (f" as {alias.asname}" if alias.asname else ""),
                    "docstring": None,
                })
            self.generic_visit(node)

        def visit_ImportFrom(self, node: ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                imported_name = f"{module}.{alias.name}" if module else alias.name
                symbols.append({
                    "symbol_type": "import",
                    "name": imported_name,
                    "start_line": node.lineno,
                    "end_line": getattr(node, "end_lineno", node.lineno),
                    "signature": f"from {module} import {alias.name}",
                    "docstring": None,
                })
            self.generic_visit(node)

        def visit_FunctionDef(self, node: ast.FunctionDef):
            self._process_function(node, is_async=False)
            self.generic_visit(node)

        def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
            self._process_function(node, is_async=True)
            self.generic_visit(node)

        def visit_ClassDef(self, node: ast.ClassDef):
            bases = [b.id for b in node.bases if isinstance(b, ast.Name)]
            signature = f"class {node.name}" + (f"({', '.join(bases)})" if bases else "")
            docstring = ast.get_docstring(node)

            symbols.append({
                "symbol_type": "class",
                "name": node.name,
                "start_line": node.lineno,
                "end_line": getattr(node, "end_lineno", node.lineno),
                "signature": signature,
                "docstring": docstring,
            })
            self.generic_visit(node)

        def _process_function(self, node, is_async: bool):
            args = [a.arg for a in node.args.args]
            prefix = "async def " if is_async else "def "
            signature = f"{prefix}{node.name}({', '.join(args)})"
            docstring = ast.get_docstring(node)

            symbols.append({
                "symbol_type": "function",
                "name": node.name,
                "start_line": node.lineno,
                "end_line": getattr(node, "end_lineno", node.lineno),
                "signature": signature,
                "docstring": docstring,
            })

    visitor = SymbolVisitor()
    visitor.visit(tree)
    return symbols


def parse_javascript_typescript(content: str) -> List[Dict[str, Any]]:
    """
    Parses JavaScript/TypeScript code using regex pattern matching for
    functions, arrow functions, classes, and import statements.
    """
    symbols: List[Dict[str, Any]] = []
    lines = content.splitlines()

    # Pattern for imports: import { x } from 'y' or const x = require('y')
    import_pattern = re.compile(
        r'^\s*(?:import\s+(?:(?:\*\s+as\s+\w+|\{?[^}\n]+\}?)\s+from\s+)?[\'"]([^\'"]+)[\'"]|const\s+.*=\s*require\([\'"]([^\'"]+)[\'"]\))'
    )
    # Pattern for functions: function foo(...) or async function foo(...)
    func_pattern = re.compile(
        r'^\s*(?:export\s+)?(?:async\s+)?function\s*([a-zA-Z0-9_$]+)\s*\(([^)]*)\)'
    )
    # Pattern for arrow functions: const foo = (...) => or export const foo = async (...) =>
    arrow_pattern = re.compile(
        r'^\s*(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>'
    )
    # Pattern for classes: class Foo or export class Foo extends Bar
    class_pattern = re.compile(
        r'^\s*(?:export\s+)?class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?'
    )

    for i, line in enumerate(lines, start=1):
        # Check Imports
        imp_match = import_pattern.match(line)
        if imp_match:
            mod_name = imp_match.group(1) or imp_match.group(2)
            if mod_name:
                symbols.append({
                    "symbol_type": "import",
                    "name": mod_name,
                    "start_line": i,
                    "end_line": i,
                    "signature": line.strip(),
                    "docstring": None,
                })
                continue

        # Check Classes
        class_match = class_pattern.match(line)
        if class_match:
            class_name = class_match.group(1)
            base_class = class_match.group(2)
            sig = f"class {class_name}" + (f" extends {base_class}" if base_class else "")
            symbols.append({
                "symbol_type": "class",
                "name": class_name,
                "start_line": i,
                "end_line": i,
                "signature": sig,
                "docstring": None,
            })
            continue

        # Check Functions
        func_match = func_pattern.match(line)
        if func_match:
            fn_name = func_match.group(1)
            params = func_match.group(2)
            symbols.append({
                "symbol_type": "function",
                "name": fn_name,
                "start_line": i,
                "end_line": i,
                "signature": f"function {fn_name}({params})",
                "docstring": None,
            })
            continue

        # Check Arrow Functions
        arrow_match = arrow_pattern.match(line)
        if arrow_match:
            fn_name = arrow_match.group(1)
            params = arrow_match.group(2)
            symbols.append({
                "symbol_type": "function",
                "name": fn_name,
                "start_line": i,
                "end_line": i,
                "signature": f"const {fn_name} = ({params}) =>",
                "docstring": None,
            })

    return symbols


def extract_file_ast_symbols(file_path: Path, file_type: str) -> List[Dict[str, Any]]:
    """
    Reads code file and delegates parsing to appropriate AST parser engine based on file extension.
    """
    if not file_path.exists() or not file_path.is_file():
        return []

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return []

    ext = file_type.lower()
    if ext == "py":
        return parse_python_ast(content, filename=file_path.name)
    elif ext in ["js", "jsx", "ts", "tsx"]:
        return parse_javascript_typescript(content)
    else:
        return []
