export default function RepoPage({ params }: { params: { owner: string; repo: string } }) {
  return <div style={{ padding: 40 }}>Repo: {params.owner}/{params.repo} — Phase 4</div>
}
