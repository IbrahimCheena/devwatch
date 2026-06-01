import json
import click
import requests
import os
from datetime import datetime


def call_huggingface(prompt: str, token: str) -> str:
    url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 800,
            "temperature": 0.7,
            "return_full_text": False
        }
    }
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    if response.status_code == 200:
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get('generated_text', '').strip()
    return None


def fallback_report(analysis: dict, ci_pass_rate: float) -> str:
    quality = analysis['quality_score']
    coverage = analysis['coverage_ratio'] * 100
    rating = 'Excellent' if quality >= 85 else 'Good' if quality >= 70 else 'Fair' if quality >= 55 else 'Poor'
    return f"""# QA Health Report — {analysis['owner']}/{analysis['repo']}

Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

## Executive Summary

Repository {analysis['owner']}/{analysis['repo']} has been analyzed across code quality,
test coverage and CI/CD health signals. Overall quality score is {quality}/100
with a CI pass rate of {ci_pass_rate:.1%}.

## Key Metrics

| Metric | Value |
|--------|-------|
| Quality Score | {quality}/100 |
| CI Pass Rate | {ci_pass_rate:.1%} |
| Test Coverage | {coverage:.1f}% |
| Total Files | {analysis['total_files']} |
| Test Files | {analysis['test_files']} |
| Open TODOs | {analysis['todo_count']} |
| Languages | {len(analysis['languages'])} |

## Overall Health Rating

**{rating}**
"""


@click.command()
@click.option('--analysis-file', required=True, help='Path to analysis JSON file')
@click.option('--ci-pass-rate', default=0.8, type=float, help='CI pass rate 0.0 to 1.0')
@click.option('--hf-token', envvar='HUGGINGFACE_TOKEN', help='HuggingFace API token')
@click.option('--output-file', default=None, help='Optional path to save report markdown')
def main(analysis_file, ci_pass_rate, hf_token, output_file):
    with open(analysis_file, 'r') as f:
        analysis = json.load(f)

    print(f"Generating QA report for {analysis['owner']}/{analysis['repo']}...")

    prompt = f"""<s>[INST] You are a senior software engineer reviewing a GitHub repository health report.

Repository: {analysis['owner']}/{analysis['repo']}
Quality Score: {analysis['quality_score']}/100
CI Pass Rate: {ci_pass_rate:.1%}
Test Coverage: {analysis['coverage_ratio']:.1%} ({analysis['test_files']} test files of {analysis['code_files']} total)
Open TODOs: {analysis['todo_count']}
Languages detected: {', '.join(analysis['languages'])}

Write a professional QA health report in markdown. Include:
1. Executive Summary (2 to 3 sentences)
2. Key Strengths
3. Areas for Improvement
4. Recommended Actions (numbered list)
5. Overall Health Rating (Excellent, Good, Fair or Poor)

Be specific, actionable and concise. [/INST]"""

    report_content = None
    if hf_token:
        print("Calling HuggingFace API...")
        report_content = call_huggingface(prompt, hf_token)

    if not report_content:
        print("Using fallback report generator...")
        report_content = fallback_report(analysis, ci_pass_rate)

    print("\n" + "="*60)
    print(report_content)
    print("="*60 + "\n")

    if output_file:
        with open(output_file, 'w') as f:
            f.write(report_content)
        print(f"Report saved to {output_file}")


if __name__ == '__main__':
    main()
