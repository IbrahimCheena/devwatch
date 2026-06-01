'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonCard } from '@/components/SkeletonCard'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function CICDPage() {
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState('')
  const [repos, setRepos] = useState<any[]>([])
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const token = sessionData?.accessToken
        if (!token) { setLoading(false); return }
        const cleanUrl = (backendUrl || '').replace(/\/$/, '')
        const reposRes = await fetch(`${cleanUrl}/api/repos`, {
          headers: { 'X-GitHub-Token': token }
        })
        if (reposRes.ok) {
          const reposData = await reposRes.json()
          setRepos(reposData)
          if (reposData.length > 0) {
            const first = reposData[0]
            setSelectedRepo(`${first.owner}/${first.name}`)
            const runsRes = await fetch(
              `${cleanUrl}/api/repos/${first.owner}/${first.name}/ci-runs`,
              { headers: { 'X-GitHub-Token': token } }
            )
            if (runsRes.ok) {
              const runsData = await runsRes.json()
              setRuns(runsData)
            }
          }
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const passCount = runs.filter(r => r.conclusion === 'success').length
  const failCount = runs.filter(r => r.conclusion === 'failure').length
  const passRate = runs.length > 0 ? Math.round((passCount / runs.length) * 100) : 0

  const chartData = runs.slice().reverse().map((r, i) => ({
    run: `#${i + 1}`,
    passed: r.conclusion === 'success' ? 1 : 0,
    conclusion: r.conclusion,
  }))

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 4 }}>CI/CD Monitor</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>GitHub Actions workflow run history</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} height={120} />)}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Runs', value: runs.length, color: 'var(--ink)' },
              { label: 'Pass Rate', value: `${passRate}%`, color: 'var(--teal)' },
              { label: 'Failures', value: failCount, color: 'var(--orange)' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}
              >
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, color: m.color, letterSpacing: '-1px' }}>{m.value}</div>
              </motion.div>
            ))}
          </div>

          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}
            >
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>
                Pipeline Health — {selectedRepo}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ciGradCicd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="run" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                  <YAxis domain={[0, 1]} tickFormatter={v => v === 1 ? 'Pass' : 'Fail'} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                  <Tooltip formatter={v => v === 1 ? 'Passed' : 'Failed'} />
                  <Area type="monotone" dataKey="passed" stroke="var(--teal)" fill="url(#ciGradCicd)" strokeWidth={2} isAnimationActive animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Recent Runs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {runs.slice(0, 10).map((run, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  {run.conclusion === 'success' ? (
                    <CheckCircle size={16} color="var(--teal)" />
                  ) : run.conclusion === 'failure' ? (
                    <XCircle size={16} color="var(--orange)" />
                  ) : (
                    <Clock size={16} color="var(--ink-muted)" />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{run.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{new Date(run.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                    background: run.conclusion === 'success' ? 'var(--teal-light)' : run.conclusion === 'failure' ? 'var(--orange-light)' : 'var(--border)',
                    color: run.conclusion === 'success' ? 'var(--teal)' : run.conclusion === 'failure' ? 'var(--orange)' : 'var(--ink-muted)',
                  }}>
                    {run.conclusion || run.status}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
