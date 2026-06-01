# DevWatch Scripts

Python scripts for static code analysis, coverage tracking and AI report generation.

## Setup

pip install -r requirements.txt

## Scripts

### analyze_repo.py
Clones a GitHub repo and runs static analysis producing a JSON result.

python analyze_repo.py --owner microsoft --repo vscode --token YOUR_TOKEN --output-dir ./output

### coverage_tracker.py
Reads an analysis JSON and saves a coverage snapshot to Supabase.

python coverage_tracker.py --analysis-file ./output/analysis_microsoft_vscode.json --supabase-url YOUR_URL --supabase-key YOUR_KEY --repo-id 1

### generate_report.py
Generates an AI powered QA report from analysis data using HuggingFace.

python generate_report.py --analysis-file ./output/analysis_microsoft_vscode.json --ci-pass-rate 0.85 --hf-token YOUR_TOKEN
