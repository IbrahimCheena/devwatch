'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FileText, Download, Clock } from 'lucide-react'
import { SkeletonCard } from '@/components/SkeletonCard'
import Link from 'next/link'

export default function ReportsPage() {
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
        if (res.ok) setRepos(await res.json())
      } catch {}
      finally { setLoading(false) }
    }
    fetchRepos()
  }, [])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 4 }}>QA Reports</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>AI-generated health reports for your repositories</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} height={100} />)}
        </div>
      ) : repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)' }}>
          <FileText size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No reports generated yet</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Open a repository and click Generate Report to create your first QA report</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {repos.map((r: any, i: number) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ width: 40, height: 40, background: 'var(--orange-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--orange)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{r.owner}/{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} />
                  Click to generate or view latest report
                </div>
              </div>
              <Link href={`/dashboard/${r.owner}/${r.name}/report`} style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--ink)', color: 'var(--cream)',
                    border: 'none', borderRadius: 100, padding: '8px 16px',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Download size={12} />
                  View Report
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
