import os
import json
import click
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

TEST_PATTERNS = [
    'test', 'tests', 'spec', 'specs', '__tests__',
    '_test', '_spec', 'test_', 'spec_'
]

CODE_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java',
    '.go', '.rb', '.php', '.cs', '.cpp', '.c', '.rs'
}

IGNORE_DIRS = {
    'node_modules', '.git', '__pycache__', '.next',
    'dist', 'build', 'target', 'venv', '.venv', 'env'
}


def is_test_file(filepath: str) -> bool:
    path = Path(filepath)
    name_lower = path.stem.lower()
    parts_lower = [p.lower() for p in path.parts]
    for pattern in TEST_PATTERNS:
        if pattern in name_lower:
            return True
        if any(pattern == part for part in parts_lower):
            return True
    return False


def count_todos(content: str) -> int:
    count = 0
    for line in content.splitlines():
        line_lower = line.lower()
        if any(kw in line_lower for kw in ['todo', 'fixme', 'hack', 'xxx']):
            count += 1
    return count


def analyze_directory(path: str) -> dict:
    total_files = 0
    code_files = 0
    test_files = 0
    todo_count = 0
    languages = set()
    file_details = []

    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for filename in files:
            filepath = os.path.join(root, filename)
            ext = Path(filename).suffix.lower()
            total_files += 1
            if ext in CODE_EXTENSIONS:
                code_files += 1
                languages.add(ext)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    todos = count_todos(content)
                    todo_count += todos
                    is_test = is_test_file(filepath)
                    if is_test:
                        test_files += 1
                    file_details.append({
                        'path': os.path.relpath(filepath, path),
                        'extension': ext,
                        'is_test': is_test,
                        'todos': todos,
                        'lines': len(content.splitlines())
                    })
                except Exception:
                    pass

    return {
        'total_files': total_files,
        'code_files': code_files,
        'test_files': test_files,
        'todo_count': todo_count,
        'languages': list(languages),
        'file_details': file_details
    }


def compute_quality_score(stats: dict) -> float:
    score = 0.0
    code_files = stats['code_files']
    test_files = stats['test_files']
    todo_count = stats['todo_count']
    languages = len(stats['languages'])

    if code_files > 0:
        test_ratio = test_files / code_files
        score += min(test_ratio * 2, 1.0) * 40
    else:
        score += 20

    if code_files > 0:
        todo_density = todo_count / code_files
        todo_score = max(0, 1 - (todo_density / 5))
        score += todo_score * 20
    else:
        score += 20

    if code_files > 0:
        avg_lines = sum(f['lines'] for f in stats['file_details'] if not f['is_test'])
        avg_lines = avg_lines / max(code_files - test_files, 1)
        structure_score = 1.0 if avg_lines < 200 else max(0, 1 - (avg_lines - 200) / 800)
        score += structure_score * 20
    else:
        score += 10

    diversity_score = min(languages / 3, 1.0)
    score += diversity_score * 20

    return round(min(score, 100.0), 2)


@click.command()
@click.option('--owner', required=True, help='GitHub repo owner')
@click.option('--repo', required=True, help='GitHub repo name')
@click.option('--token', required=True, help='GitHub access token')
@click.option('--output-dir', default='.', help='Output directory for analysis JSON')
def main(owner, repo, token, output_dir):
    print(f"Analyzing {owner}/{repo}...")
    tmp_dir = tempfile.mkdtemp()
    try:
        import git
        clone_url = f"https://{token}@github.com/{owner}/{repo}.git"
        print(f"Cloning repository...")
        git.Repo.clone_from(clone_url, tmp_dir, depth=1)
        print("Clone complete. Running analysis...")
        stats = analyze_directory(tmp_dir)
        quality_score = compute_quality_score(stats)
        result = {
            'owner': owner,
            'repo': repo,
            'analyzed_at': datetime.utcnow().isoformat(),
            'total_files': stats['total_files'],
            'code_files': stats['code_files'],
            'test_files': stats['test_files'],
            'todo_count': stats['todo_count'],
            'languages': stats['languages'],
            'quality_score': quality_score,
            'coverage_ratio': round(stats['test_files'] / max(stats['code_files'], 1), 4),
        }
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, f"analysis_{owner}_{repo}.json")
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Analysis complete. Quality score: {quality_score}/100")
        print(f"Results saved to {output_file}")
        return result
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == '__main__':
    main()
