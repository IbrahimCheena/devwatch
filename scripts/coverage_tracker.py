import json
import click
import requests
from datetime import datetime


@click.command()
@click.option('--analysis-file', required=True, help='Path to analysis JSON file')
@click.option('--supabase-url', required=True, help='Supabase project URL')
@click.option('--supabase-key', required=True, help='Supabase service role key')
@click.option('--repo-id', required=True, type=int, help='Repository ID in database')
def main(analysis_file, supabase_url, supabase_key, repo_id):
    print(f"Reading analysis from {analysis_file}...")
    with open(analysis_file, 'r') as f:
        analysis = json.load(f)

    payload = {
        'repo_id': repo_id,
        'total_files': analysis['total_files'],
        'test_files': analysis['test_files'],
        'coverage_ratio': analysis['coverage_ratio'],
        'quality_score': analysis['quality_score'],
        'recorded_at': datetime.utcnow().isoformat()
    }

    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }

    response = requests.post(
        f'{supabase_url}/rest/v1/coverage_snapshots',
        json=payload,
        headers=headers
    )

    if response.status_code in (200, 201):
        print(f"Coverage snapshot saved successfully for repo {repo_id}")
        print(f"Quality score: {analysis['quality_score']}/100")
        print(f"Coverage ratio: {analysis['coverage_ratio']:.1%}")
    else:
        print(f"Failed to save snapshot: {response.status_code} {response.text}")


if __name__ == '__main__':
    main()
