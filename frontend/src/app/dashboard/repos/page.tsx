'use client'

import { motion } from 'framer-motion'
import { GitBranch, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SkeletonCard } from '@/components/SkeletonCard'
import Link from 'next/link'

export default function ReposPage() {
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const token = sessionData?.accessToken
        if (!token) { setLoading(false); return }
        const cleanUrl = (backendUrl || '').replace(/\/$/, '')
        const res = await fetch(`${cleanUrl}/api/repos`, {
          headers: { 'X-GitHub-Token': token }
        })
        if (res.ok) {
          const data = await res.json()
          setRepos(data)
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchRepos()
  }, [])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 4 }}>Repositories</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>All your connected GitHub repositories</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5].map(i => <SkeletonCard key={i} height={72} />)}
        </div>
      ) : repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)' }}>
          <GitBranch size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No repositories connected yet</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Go to Dashboard and click Connect Repo to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {repos.map((r: any, i: number) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/${r.owner}/${r.name}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(26,20,16,0.06)' }}
                  style={{
                    background: 'var(--warm-white)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 20px',
                    display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 32, height: 32, background: 'var(--orange-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GitBranch size={14} color="var(--orange)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{r.owner}/{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>Branch: {r.defaultBranch || 'main'}</div>
                  </div>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
