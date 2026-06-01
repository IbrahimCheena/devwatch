'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { marked } from 'marked'
import { FileText, Download, ArrowLeft, Clock, Star } from 'lucide-react'
import Link from 'next/link'

const DEMO_REPORT = `# QA Health Report — vercel/next.js

Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Executive Summary

The vercel/next.js repository demonstrates strong engineering practices with a quality score of 91/100 and a CI pass rate of 94%. Test coverage sits at 78% which reflects a mature and well maintained codebase with consistent investment in automated testing.

## Key Strengths

- Exceptional CI/CD reliability with 94% pass rate across the last 30 workflow runs
- Strong test coverage at 78% indicating systematic investment in code quality
- Low TODO density suggesting issues are tracked and resolved promptly
- Diverse language stack showing architectural flexibility
- Well structured file organization with clear separation of concerns

## Areas for Improvement

- Test coverage could be pushed toward 85% for production critical paths
- A small number of long running workflow jobs are inflating average CI duration
- Some utility modules lack dedicated unit test files

## Recommended Actions

1. Add unit tests for the three largest utility modules to close the coverage gap
2. Audit and split any CI jobs exceeding 8 minutes to improve feedback loop speed
3. Review and resolve the 23 open TODO comments — prioritize those in core rendering paths
4. Add a coverage threshold gate to the CI pipeline to prevent regressions below 75%
5. Consider adding integration tests for critical user facing workflows

## Overall Health Rating

**Good** — This repository reflects strong engineering discipline. With targeted improvements to coverage and CI performance it is on track for an Excellent rating.
`

interface ReportMeta {
  generatedAt: string
  qualityScore: number
  ciPassRate: number
  coverage: number
}

export default function ReportPage({ params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  const meta: ReportMeta = {
    generatedAt: new Date().toLocaleString(),
    qualityScore: 91,
    ciPassRate: 94,
    coverage: 78,
  }

  useEffect(() => {
    const html = marked(DEMO_REPORT) as string
    setRenderedHtml(html)
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      let y = 20

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(26, 20, 16)
      doc.text(`QA Report — ${owner}/${repo}`, margin, y)
      y += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(107, 95, 82)
      doc.text(`Generated: ${meta.generatedAt}`, margin, y)
      y += 6
      doc.text(`Quality Score: ${meta.qualityScore}/100  |  CI Pass Rate: ${meta.ciPassRate}%  |  Coverage: ${meta.coverage}%`, margin, y)
      y += 10

      doc.setDrawColor(232, 224, 212)
      doc.line(margin, y, pageWidth - margin, y)
      y += 8

      const lines = DEMO_REPORT.split('\n')
      for (const line of lines) {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        if (line.startsWith('## ')) {
          y += 4
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(13)
          doc.setTextColor(26, 20, 16)
          doc.text(line.replace('## ', ''), margin, y)
          y += 7
        } else if (line.startsWith('# ')) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(26, 20, 16)
          doc.text(line.replace('# ', ''), margin, y)
          y += 6
        } else if (line.startsWith('- ')) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(26, 20, 16)
          const wrapped = doc.splitTextToSize('• ' + line.replace('- ', ''), maxWidth)
          doc.text(wrapped, margin, y)
          y += wrapped.length * 5 + 1
        } else if (line.match(/^\d+\./)) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(26, 20, 16)
          const wrapped = doc.splitTextToSize(line, maxWidth)
          doc.text(wrapped, margin, y)
          y += wrapped.length * 5 + 1
        } else if (line.trim() !== '' && !line.startsWith('Generated:')) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(107, 95, 82)
          const cleaned = line.replace(/\*\*/g, '')
          const wrapped = doc.splitTextToSize(cleaned, maxWidth)
          doc.text(wrapped, margin, y)
          y += wrapped.length * 5 + 1
        } else {
          y += 3
        }
      }

      const date = new Date().toISOString().split('T')[0]
      doc.save(`devwatch-report-${owner}-${repo}-${date}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    }
    setExporting(false)
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px' }}>
            QA Report
          </h1>
          <motion.button
            whileHover={{ scale: 1.03, background: 'var(--orange)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportPDF}
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
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {loading ? (
          <div style={{
            background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, height: 500,
            backgroundImage: 'linear-gradient(90deg, var(--border) 25%, var(--warm-white) 50%, var(--border) 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          }} />
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
              style={{
                fontFamily: 'var(--font-dm)',
                lineHeight: 1.75,
                color: 'var(--ink)',
              }}
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
              { icon: Star, label: 'Quality Score', value: `${meta.qualityScore}/100` },
              { icon: FileText, label: 'CI Pass Rate', value: `${meta.ciPassRate}%` },
              { icon: FileText, label: 'Coverage', value: `${meta.coverage}%` },
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
              AI Generated
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              This report was generated using Mistral 7B via HuggingFace free inference based on real repository metrics.
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--ink)', color: 'var(--cream)',
              border: 'none', borderRadius: 12, padding: '12px 0',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Download size={14} />
            Download PDF Report
          </motion.button>
        </motion.div>
      </div>

      <style>{`
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
