'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { marked } from 'marked'
import { FileText, Download, ArrowLeft, Clock, Star, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ReportMeta {
  generatedAt: string
  qualityScore: number
  ciPassRate: number
  coverage: number
}

export default function ReportPage({ params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState('')
  const [reportContent, setReportContent] = useState('')
  const [toast, setToast] = useState('')
  const [meta, setMeta] = useState<ReportMeta>({
    generatedAt: new Date().toLocaleString(),
    qualityScore: 0,
    ciPassRate: 0,
    coverage: 0,
  })
  const [hasReport, setHasReport] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const getToken = async () => {
    const sessionRes = await fetch('/api/auth/session')
    const sessionData = await sessionRes.json()
    return sessionData?.accessToken || ''
  }

  const fetchLatestReport = async () => {
    try {
      const token = await getToken()
      const cleanUrl = (backendUrl || '').replace(/\/$/, '')
      const res = await fetch(
        `${cleanUrl}/api/repos/${owner}/${repo}/report/latest`,
        { headers: { 'X-GitHub-Token': token } }
      )
      if (res.ok) {
        const data = await res.json()
        if (data && data.content) {
          setReportContent(data.content)
          const html = marked(data.content) as string
          setRenderedHtml(html)
          setMeta({
            generatedAt: new Date(data.generatedAt).toLocaleString(),
            qualityScore: Math.round(data.qualityScore || 0),
            ciPassRate: Math.round((data.ciPassRate || 0) * 100),
            coverage: Math.round((data.coverageRatio || 0) * 100),
          })
          setHasReport(true)
        }
      }
    } catch {}
  }

  useEffect(() => {
    const init = async () => {
      await fetchLatestReport()
      setLoading(false)
    }
    init()
  }, [owner, repo])

  // handleExportPDF defined BEFORE handleGenerateReport so auto-download can call it
  const handleExportPDF = async (content?: string, metaOverride?: ReportMeta) => {
    const pdf_content = content || reportContent
    const pdf_meta = metaOverride || meta
    if (!pdf_content) return
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 24
      const maxWidth = pageWidth - margin * 2
      let y = 0

      doc.setFillColor(26, 20, 16)
      doc.rect(0, 0, pageWidth, 40, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(255, 255, 255)
      doc.text('DevWatch', margin, 18)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(200, 190, 180)
      doc.text('QA Health Report', margin, 28)
      doc.setFontSize(9)
      doc.text(`${owner}/${repo}  ·  ${pdf_meta.generatedAt}`, pageWidth - margin, 28, { align: 'right' })

      y = 52
      doc.setFillColor(250, 248, 244)
      doc.rect(margin, y, maxWidth, 22, 'F')
      doc.setDrawColor(232, 224, 212)
      doc.rect(margin, y, maxWidth, 22, 'S')
      const metrics = [
        { label: 'Quality Score', value: `${pdf_meta.qualityScore}/100` },
        { label: 'CI Pass Rate', value: `${pdf_meta.ciPassRate}%` },
        { label: 'Coverage', value: `${pdf_meta.coverage}%` },
      ]
      metrics.forEach((m, i) => {
        const x = margin + (maxWidth / 3) * i + maxWidth / 6
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(26, 20, 16)
        doc.text(m.value, x, y + 10, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(107, 95, 82)
        doc.text(m.label, x, y + 17, { align: 'center' })
      })

      y = 86
      const lines = pdf_content.split('\n')
      for (const line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 24
        }
        if (line.startsWith('## ')) {
          y += 6
          doc.setFillColor(244, 98, 42)
          doc.rect(margin, y - 4, 3, 12, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(12)
          doc.setTextColor(26, 20, 16)
          doc.text(line.replace('## ', ''), margin + 7, y + 4)
          y += 12
          doc.setDrawColor(232, 224, 212)
          doc.line(margin, y, pageWidth - margin, y)
          y += 6
        } else if (line.startsWith('# ')) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.setTextColor(107, 95, 82)
          doc.text(line.replace('# ', ''), margin, y)
          y += 7
        } else if (line.startsWith('- ')) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(26, 20, 16)
          doc.setFillColor(244, 98, 42)
          doc.circle(margin + 2, y - 1, 1, 'F')
          const wrapped = doc.splitTextToSize(line.replace('- ', ''), maxWidth - 8)
          doc.text(wrapped, margin + 6, y)
          y += wrapped.length * 5.5 + 2
        } else if (line.match(/^\d+\./)) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(26, 20, 16)
          const wrapped = doc.splitTextToSize(line, maxWidth - 4)
          doc.text(wrapped, margin + 4, y)
          y += wrapped.length * 5.5 + 2
        } else if (line.trim() !== '') {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(60, 50, 40)
          const cleaned = line.replace(/\*\*/g, '')
          const wrapped = doc.splitTextToSize(cleaned, maxWidth)
          doc.text(wrapped, margin, y)
          y += wrapped.length * 5.5 + 2
        } else {
          y += 3
        }
      }

      doc.setFillColor(26, 20, 16)
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(200, 190, 180)
      doc.text('Generated by DevWatch · devwatch-two.vercel.app', pageWidth / 2, pageHeight - 4, { align: 'center' })

      const date = new Date().toISOString().split('T')[0]
      doc.save(`devwatch-report-${owner}-${repo}-${date}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    }
    setExporting(false)
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const token = await getToken()
      const cleanUrl = (backendUrl || '').replace(/\/$/, '')
      const res = await fetch(
        `${cleanUrl}/api/repos/${owner}/${repo}/report/generate`,
        {
          method: 'POST',
          headers: { 'X-GitHub-Token': token }
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data && data.content) {
          const newMeta: ReportMeta = {
            generatedAt: new Date(data.generatedAt).toLocaleString(),
            qualityScore: Math.round(data.qualityScore || 0),
            ciPassRate: Math.round((data.ciPassRate || 0) * 100),
            coverage: Math.round((data.coverageRatio || 0) * 100),
          }
          setReportContent(data.content)
          const html = marked(data.content) as string
          setRenderedHtml(html)
          setMeta(newMeta)
          setHasReport(true)
          setToast('AI Report generated successfully')
          setTimeout(() => setToast(''), 3000)
          setTimeout(async () => {
            await handleExportPDF(data.content, newMeta)
          }, 500)
        }
      }
    } catch (err) {
      console.error('Failed to generate report:', err)
    }
    setGenerating(false)
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ArrowLeft size={14} color="var(--ink-muted)" />
          <Link href={`/dashboard/${owner}/${repo}`} style={{ fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none' }}>
            Back to {owner}/{repo}
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px' }}>
            QA Report — {owner}/{repo}
          </h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerateReport}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--warm-white)', color: 'var(--ink)',
                border: '1px solid var(--border)', borderRadius: 100,
                padding: '10px 20px', fontSize: 13, fontWeight: 500,
                cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: generating ? 0.7 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
              {generating ? 'Generating AI Report...' : hasReport ? 'Regenerate Report' : 'Generate AI Report'}
            </motion.button>
            {hasReport && (
              <motion.button
                whileHover={{ scale: 1.03, background: 'var(--orange)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleExportPDF()}
                disabled={exporting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--ink)', color: 'var(--cream)',
                  border: 'none', borderRadius: 100,
                  padding: '10px 20px', fontSize: 13, fontWeight: 500,
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: exporting ? 0.7 : 1,
                  transition: 'background 0.2s',
                }}
              >
                <Download size={13} />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {loading ? (
          <div style={{
            background: 'var(--warm-white)', border: '1px solid var(--border)',
            borderRadius: 16, height: 500,
            backgroundImage: 'linear-gradient(90deg, var(--border) 25%, var(--warm-white) 50%, var(--border) 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
          }} />
        ) : !hasReport ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'var(--warm-white)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '80px 40px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              No report yet
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Click Generate AI Report to create a personalized QA health report for {owner}/{repo} using Mistral 7B via HuggingFace.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerateReport}
              disabled={generating}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--ink)', color: 'var(--cream)',
                border: 'none', borderRadius: 100, padding: '12px 28px',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <RefreshCw size={14} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
              {generating ? 'Generating...' : 'Generate AI Report'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            ref={reportRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'var(--warm-white)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '32px 40px',
            }}
          >
            <div
              className="report-content"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              style={{ fontFamily: 'var(--font-dm)', lineHeight: 1.75, color: 'var(--ink)' }}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Report Details
            </div>
            {[
              { icon: Clock, label: 'Generated', value: meta.generatedAt },
              { icon: Star, label: 'Quality Score', value: meta.qualityScore > 0 ? `${meta.qualityScore}/100` : 'Run scan first' },
              { icon: FileText, label: 'CI Pass Rate', value: meta.ciPassRate > 0 ? `${meta.ciPassRate}%` : 'Pending' },
              { icon: FileText, label: 'Coverage', value: meta.coverage > 0 ? `${meta.coverage}%` : 'Pending' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, background: 'var(--orange-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} color="var(--orange)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginTop: 1 }}>{item.value}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: 'var(--orange-light)', border: '1px solid rgba(244,98,42,0.2)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--orange)', marginBottom: 6 }}>
              🤖 Powered by Mistral 7B
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              Reports are uniquely generated for {owner}/{repo} using real repository metrics via HuggingFace free inference. Each report is personalized to your actual codebase.
            </div>
          </div>

          {hasReport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleExportPDF()}
              disabled={exporting}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                background: 'var(--ink)', color: 'var(--cream)',
                border: 'none', borderRadius: 12, padding: '12px 0',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Download size={14} />
              Download PDF Report
            </motion.button>
          )}
        </motion.div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 999,
            background: 'var(--ink)', color: 'var(--cream)',
            padding: '12px 24px', borderRadius: 100,
            fontSize: 14, fontWeight: 500,
            boxShadow: '0 8px 32px rgba(26,20,16,0.25)',
          }}
        >
          ✓ {toast}
        </motion.div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .report-content h1 { font-family: var(--font-syne); font-size: 22px; font-weight: 800; color: var(--ink); margin: 0 0 16px; }
        .report-content h2 { font-family: var(--font-syne); font-size: 17px; font-weight: 700; color: var(--ink); margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
        .report-content p { margin: 0 0 14px; color: var(--ink); }
        .report-content ul { padding-left: 20px; margin: 0 0 14px; }
        .report-content li { margin-bottom: 6px; color: var(--ink); }
        .report-content ol { padding-left: 20px; margin: 0 0 14px; }
        .report-content strong { color: var(--orange); font-weight: 600; }
        .report-content code { background: var(--orange-light); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; }
      `}</style>
    </div>
  )
}
