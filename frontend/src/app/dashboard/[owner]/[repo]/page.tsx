'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { RefreshCw, FileText, GitBranch } from 'lucide-react'
import Link from 'next/link'

function generateCIData() {
  return Array.from({ length: 20 }, (_, i) => ({
    day: `Day ${i + 1}`,
    passed: Math.random() > 0.2 ? 1 : 0,
    duration: Math.floor(60 + Math.random() * 180),
  }))
}

function generateCoverageData() {
  let base = 65
  return Array.from({ length: 12 }, (_, i) => {
    base += (Math.random() - 0.3) * 3
    return { week: `W${i + 1}`, coverage: parseFloat(base.toFixed(1)) }
  })
}

const radarData = [
  { subject: 'Test Ratio', value: 78 },
  { subject: 'CI Health', value: 87 },
  { subject: 'TODO Density', value: 65 },
  { subject: 'File Structure', value: 82 },
  { subject: 'Lang Diversity', value: 70 },
]

export default function RepoPage({ params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [ciData] = useState(generateCIData)
  const [coverageData] = useState(generateCoverageData)
  const [todoCount, setTodoCount] = useState(0)
  const [qualityScore, setQualityScore] = useState(84)

  const passRate = Math.round((ciData.filter(d => d.passed).length / ciData.length) * 100)
  const latestCoverage = coverageData[coverageData.length - 1].coverage

  useEffect(() => {
    const t = setTimeout(async () => {
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const token = sessionData?.accessToken
      const cleanUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '')
      if (token) {
        try {
          const coverageRes = await fetch(
            `${cleanUrl}/api/repos/${owner}/${repo}/coverage`,
            { headers: { 'X-GitHub-Token': token } }
          )
          if (coverageRes.ok) {
            const snapshots = await coverageRes.json()
            if (snapshots && snapshots.length > 0) {
              setQualityScore(Math.round(snapshots[0].qualityScore || 84))
            }
          }
        } catch {}
      }
      setLoading(false)
    }, 1000)
    return () => clearTimeout(t)
  }, [owner, repo])

  const handleScan = async () => {
    setScanning(true)
    await new Promise(r => setTimeout(r, 2000))
    setScanning(false)
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2500))
    setGenerating(false)
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <GitBranch size={14} color="var(--ink-muted)" />
          <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dashboard</Link>
            {' / '}{owner}/{repo}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px' }}>
            {owner}/{repo}
          </h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleScan}
              disabled={scanning}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--warm-white)', color: 'var(--ink)',
                border: '1px solid var(--border)', borderRadius: 100,
                padding: '8px 16px', fontSize: 13, fontWeight: 500,
                cursor: scanning ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                opacity: scanning ? 0.7 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: scanning ? 'spin 1s linear infinite' : 'none' }} />
              {scanning ? 'Scanning...' : 'Run Scan'}
            </motion.button>
            <Link href={`/dashboard/${owner}/${repo}/report`} style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerateReport}
                disabled={generating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--ink)', color: 'var(--cream)',
                  border: 'none', borderRadius: 100,
                  padding: '8px 16px', fontSize: 13, fontWeight: 500,
                  cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: generating ? 0.7 : 1,
                }}
              >
                <FileText size={13} />
                {generating ? 'Generating...' : 'Generate Report'}
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Quality Score" value={qualityScore} suffix="/100" color="var(--teal)" delay={0} />
          <StatCard label="CI Pass Rate" value={passRate} suffix="%" color="var(--orange)" delay={0.1} />
          <StatCard label="Test Coverage" value={parseFloat(latestCoverage.toFixed(0))} suffix="%" color="var(--gold)" delay={0.2} />
          <StatCard label="Open TODOs" value={todoCount} color="var(--ink-muted)" delay={0.3} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>
            CI/CD Pipeline Health — Last 20 Runs
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ciData}>
              <defs>
                <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
              <YAxis domain={[0, 1]} tickFormatter={v => v === 1 ? 'Pass' : 'Fail'} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
              <Tooltip formatter={(v) => v === 1 ? 'Passed' : 'Failed'} />
              <Area type="monotone" dataKey="passed" stroke="var(--teal)" fill="url(#ciGrad)" strokeWidth={2} isAnimationActive={true} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>
            Test Coverage Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={coverageData}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--orange)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="coverage" stroke="var(--orange)" strokeWidth={2.5} dot={{ fill: 'var(--orange)', r: 3 }} isAnimationActive={true} animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>
            Quality Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
              <Radar dataKey="value" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.2} isAnimationActive={true} animationDuration={1200} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
