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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [repos] = useState(DEMO_REPOS)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

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
          <StatCard label="Avg Quality Score" value={Math.round(repos.reduce((a,r) => a + r.quality, 0) / repos.length)} suffix="/100" color="var(--teal)" icon="⭐" delay={0.1} />
          <StatCard label="Avg CI Pass Rate" value={Math.round(repos.reduce((a,r) => a + r.ci, 0) / repos.length)} suffix="%" color="var(--orange)" icon="✅" delay={0.2} />
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
              key={r.repo}
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
                  <div style={{ fontSize: 18, color: 'var(--ink-muted)' }}>→</div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
