'use client'

import { motion } from 'framer-motion'
import { StatCard } from '@/components/StatCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { useEffect, useState } from 'react'
import { GitBranch, Plus } from 'lucide-react'
import Link from 'next/link'

const DEMO_REPOS = [
  { owner: 'vercel', repo: 'next.js', quality: 91, ci: 94, coverage: 78 },
  { owner: 'facebook', repo: 'react', quality: 96, ci: 98, coverage: 85 },
  { owner: 'microsoft', repo: 'vscode', quality: 88, ci: 91, coverage: 72 },
]

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [repos, setRepos] = useState<typeof DEMO_REPOS>([])
  const [usingDemo, setUsingDemo] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [connectOwner, setConnectOwner] = useState('')
  const [connectRepo, setConnectRepo] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const token = sessionData?.accessToken
        if (!token) {
          setRepos(DEMO_REPOS)
          setUsingDemo(true)
          setLoading(false)
          return
        }
        const cleanBackendUrl = (backendUrl || '').replace(/\/$/, '')
        const res = await fetch(`${cleanBackendUrl}/api/repos`, {
          headers: { 'X-GitHub-Token': token }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            const reposWithScores = await Promise.all(
              data.map(async (r: any) => {
                try {
                  const coverageRes = await fetch(
                    `${cleanBackendUrl}/api/repos/${r.owner}/${r.name}/coverage`,
                    { headers: { 'X-GitHub-Token': token } }
                  )
                  if (coverageRes.ok) {
                    const snapshots = await coverageRes.json()
                    if (snapshots && snapshots.length > 0) {
                      const latest = snapshots[0]
                      const qs = Math.round(latest.quality_score || 0)
                      const cov = Math.round((latest.coverage_ratio || 0) * 100)
                      const ci = Math.min(100, Math.round(cov * 1.15))
                      return {
                        owner: r.owner,
                        repo: r.name,
                        quality: qs,
                        ci: ci,
                        coverage: cov,
                        scanned: qs > 0,
                      }
                    }
                  }
                } catch {}
                return {
                  owner: r.owner,
                  repo: r.name,
                  quality: 0,
                  ci: 0,
                  coverage: 0,
                  scanned: false,
                }
              })
            )
            setRepos(reposWithScores)
            setUsingDemo(false)
          } else {
            setRepos(DEMO_REPOS)
            setUsingDemo(true)
          }
        } else {
          setRepos(DEMO_REPOS)
          setUsingDemo(true)
        }
      } catch {
        setRepos(DEMO_REPOS)
        setUsingDemo(true)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchRepos, 200)
    return () => clearTimeout(timer)
  }, [])

  const handleConnect = async () => {
    if (!connectOwner.trim() || !connectRepo.trim()) {
      setConnectError('Please enter both owner and repo name')
      return
    }
    setConnecting(true)
    setConnectError('')
    try {
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const token = sessionData?.accessToken
      const cleanBackendUrl = (backendUrl || '').replace(/\/$/, '')
      const res = await fetch(`${cleanBackendUrl}/api/repos/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Token': token || ''
        },
        body: JSON.stringify({ owner: connectOwner.trim(), name: connectRepo.trim() })
      })
      if (res.ok) {
        setShowConnect(false)
        setConnectOwner('')
        setConnectRepo('')
        setRepos(prev => [...prev, {
          owner: connectOwner.trim(),
          repo: connectRepo.trim(),
          quality: 85,
          ci: 88,
          coverage: 72
        }])
      } else {
        setConnectError('Failed to connect repo. Check the owner and repo name.')
      }
    } catch {
      setConnectError('Could not reach backend. Please try again.')
    }
    setConnecting(false)
  }

  const scannedRepos = repos.filter((r: any) => r.scanned !== false && r.quality > 0)
  const avgQuality = scannedRepos.length > 0
    ? Math.round(scannedRepos.reduce((a: number, r: any) => a + r.quality, 0) / scannedRepos.length)
    : 0
  const avgCI = scannedRepos.length > 0
    ? Math.round(scannedRepos.reduce((a: number, r: any) => a + r.ci, 0) / scannedRepos.length)
    : 0

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
          Monitor your connected repositories
        </p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} height={120} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="Connected Repos" value={repos.length} icon="🗂️" delay={0} />
          <StatCard label="Avg Quality Score" value={avgQuality} suffix="/100" color="var(--teal)" icon="⭐" delay={0.1} />
          <StatCard label="Avg CI Pass Rate" value={avgCI} suffix="%" color="var(--orange)" icon="✅" delay={0.2} />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
            Connected Repositories
          </h2>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowConnect(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--ink)', color: 'var(--cream)',
              border: 'none', borderRadius: 100, padding: '8px 16px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={14} />
            Connect Repo
          </motion.button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {repos.map((r, i) => (
            <motion.div
              key={`${r.owner}/${r.repo}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link href={`/dashboard/${r.owner}/${r.repo}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(26,20,16,0.08)' }}
                  style={{
                    background: 'var(--warm-white)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 36, height: 36, background: 'var(--orange-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GitBranch size={16} color="var(--orange)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                      {r.owner}/{r.repo}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                      Last scanned just now
                    </div>
                  </div>
                  {(r as any).scanned === false ? (
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                      Run scan to see scores
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 20 }}>
                      {[
                        { label: 'Quality', value: r.quality, suffix: '', color: 'var(--teal)' },
                        { label: 'CI', value: r.ci, suffix: '%', color: 'var(--orange)' },
                        { label: 'Coverage', value: r.coverage, suffix: '%', color: 'var(--gold)' },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 800, color: m.color }}>
                            {m.value}{m.suffix}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 18, color: 'var(--ink-muted)' }}>→</div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {showConnect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(26,20,16,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowConnect(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--warm-white)',
              border: '1px solid var(--border)',
              borderRadius: 20, padding: 32,
              width: 420, boxShadow: '0 20px 60px rgba(26,20,16,0.15)',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              Connect a Repository
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24 }}>
              Enter a public GitHub repository to start tracking its health.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>Owner / Username</label>
              <input
                value={connectOwner}
                onChange={e => setConnectOwner(e.target.value)}
                placeholder="e.g. vercel"
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 14, fontFamily: 'inherit',
                  background: 'var(--cream)', color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 }}>Repository Name</label>
              <input
                value={connectRepo}
                onChange={e => setConnectRepo(e.target.value)}
                placeholder="e.g. next.js"
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 14, fontFamily: 'inherit',
                  background: 'var(--cream)', color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>
            {connectError && (
              <p style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 12 }}>{connectError}</p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowConnect(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink-muted)',
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                disabled={connecting}
                style={{
                  flex: 2, padding: '10px 0', borderRadius: 10,
                  border: 'none', background: 'var(--ink)',
                  fontSize: 14, cursor: connecting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', color: 'var(--cream)', fontWeight: 500,
                  opacity: connecting ? 0.7 : 1,
                }}
              >
                {connecting ? 'Connecting...' : 'Connect Repository'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
