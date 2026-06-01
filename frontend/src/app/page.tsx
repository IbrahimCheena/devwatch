'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }),
}

const ciData = [
  { height: '70%', pass: true, delay: 0.1 },
  { height: '85%', pass: true, delay: 0.15 },
  { height: '40%', pass: false, delay: 0.2 },
  { height: '90%', pass: true, delay: 0.25 },
  { height: '75%', pass: true, delay: 0.3 },
  { height: '95%', pass: true, delay: 0.35 },
  { height: '30%', pass: false, delay: 0.4 },
  { height: '88%', pass: true, delay: 0.45 },
  { height: '100%', pass: true, delay: 0.5 },
  { height: '82%', pass: true, delay: 0.55 },
]

const marqueeItems = [
  'Java Spring Boot', 'Next.js 14', 'TypeScript', 'Python',
  'PostgreSQL', 'Mistral AI', 'GitHub Actions', 'HuggingFace',
  'Supabase', 'Vercel',
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 48px',
          background: 'rgba(250,248,244,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 8, height: 8, background: 'var(--orange)', borderRadius: '50%' }}
          />
          DevWatch
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="https://github.com/IbrahimCheena/devwatch" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none', cursor: 'pointer' }}>GitHub</a>
          <a href="https://github.com/IbrahimCheena/devwatch#features" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none', cursor: 'pointer' }}>Features</a>
          <a href="https://github.com/IbrahimCheena/devwatch#readme" style={{ fontSize: 14, color: 'var(--ink-muted)', textDecoration: 'none', cursor: 'pointer' }}>Docs</a>
          <motion.button
            whileHover={{ scale: 1.04, background: 'var(--orange)' }}
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            style={{
              background: 'var(--ink)', color: 'var(--cream)',
              padding: '8px 20px', borderRadius: 100,
              fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.2s',
            }}
          >
            Get started →
          </motion.button>
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 48px 80px', position: 'relative', textAlign: 'center',
      }}>

        {/* Blobs */}
{([
  { color: '#f4622a33', size: 420, extraStyle: { top: -80, right: -60 } as React.CSSProperties, animation: 'float1 9s ease-in-out infinite' },
  { color: '#0d948822', size: 300, extraStyle: { bottom: 40, left: -40 } as React.CSSProperties, animation: 'float2 11s ease-in-out infinite' },
  { color: '#d9770633', size: 200, extraStyle: { top: '50%', left: '60%' } as React.CSSProperties, animation: 'float3 7s ease-in-out infinite' },
] as Array<{ color: string; size: number; extraStyle: React.CSSProperties; animation: string }>).map((blob, i) => (
  <div key={i} style={{
    position: 'absolute',
    width: blob.size,
    height: blob.size,
    background: blob.color,
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: 0.55,
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
    animation: blob.animation,
    ...blob.extraStyle,
  }} />
))}

        {/* Badge */}
        <motion.div
          custom={0.1} variants={fadeUp} initial="hidden" animate="show"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--orange-light)',
            border: '1px solid rgba(244,98,42,0.27)',
            borderRadius: 100, padding: '6px 16px',
            fontSize: 12, fontWeight: 500, color: 'var(--orange)',
            marginBottom: 28,
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, background: 'var(--orange)', borderRadius: '50%' }}
          />
          Now with AI-generated QA reports
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0.25} variants={fadeUp} initial="hidden" animate="show"
          style={{
            fontFamily: 'var(--font-syne)', fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 62px)',
            lineHeight: 1.08, letterSpacing: '-2px',
            color: 'var(--ink)', maxWidth: 780, marginBottom: 20,
          }}
        >
          Your codebase health,{' '}
          <span style={{ color: 'var(--orange)' }}>beautifully visible.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={0.4} variants={fadeUp} initial="hidden" animate="show"
          style={{
            fontSize: 17, color: 'var(--ink-muted)',
            maxWidth: 480, lineHeight: 1.65,
            fontWeight: 300, marginBottom: 40,
          }}
        >
          Connect any GitHub repo and get real-time CI/CD monitoring, test coverage trends, and automated QA reports — all in one dashboard.
        </motion.p>

        {/* CTA */}
        <motion.div
          custom={0.55} variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}
        >
          <motion.button
            whileHover={{ scale: 1.04, background: 'var(--orange)', boxShadow: '0 8px 28px rgba(244,98,42,0.35)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--ink)', color: 'var(--cream)',
              padding: '14px 28px', borderRadius: 100,
              fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(26,20,16,0.18)',
              transition: 'background 0.25s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Connect with GitHub
          </motion.button>
        </motion.div>

        {/* Mini Dashboard Preview */}
        <motion.div
          custom={0.65} variants={fadeUp} initial="hidden" animate="show"
          style={{
            background: 'var(--warm-white)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: 24,
            maxWidth: 720, width: '100%',
            boxShadow: '0 20px 60px rgba(26,20,16,0.12)',
            marginTop: 52,
          }}
        >
          {/* Window bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            {['#f4622a', '#d97706', '#0d9488'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: 12, color: 'var(--ink-muted)' }}>
              devwatch — ibrahim/portfolio-api
            </span>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { val: '92', label: 'Quality score', color: 'var(--teal)' },
              { val: '87%', label: 'CI pass rate', color: 'var(--orange)' },
              { val: '74%', label: 'Test coverage', color: 'var(--gold)' },
              { val: '2m ago', label: 'Last scan', color: 'var(--ink-muted)', small: true },
            ].map((m) => (
              <div key={m.label} style={{
                background: 'var(--cream)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 10px', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-syne)', fontWeight: 800,
                  fontSize: m.small ? 14 : 24, color: m.color,
                  paddingTop: m.small ? 4 : 0,
                }}>{m.val}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* CI chart */}
          <div style={{
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 14, height: 120,
            display: 'flex', alignItems: 'flex-end', gap: 6,
          }}>
            {ciData.map((bar, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: bar.delay, ease: 'easeOut' }}
                style={{
                  flex: 1, height: bar.height,
                  background: bar.pass ? 'var(--teal)' : 'rgba(244,98,42,0.4)',
                  borderRadius: '4px 4px 0 0',
                  transformOrigin: 'bottom',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          custom={0.75} variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', gap: 40, marginTop: 52, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}
        >
          {[
            { num: '4.2k+', label: 'Repos analyzed' },
            null,
            { num: '98ms', label: 'Avg response time' },
            null,
            { num: '$0', label: 'API cost' },
          ].map((item, i) =>
            item === null ? (
              <div key={i} style={{ width: 1, height: 40, background: 'var(--border)' }} />
            ) : (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px' }}>{item.num}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{item.label}</div>
              </div>
            )
          )}
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section style={{ padding: '0 48px 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
        {[
          { icon: '🔍', title: 'Code Quality Scanner', desc: 'Static analysis across your entire repo with a scored health report and actionable signals.', bg: 'var(--orange-light)' },
          { icon: '📈', title: 'CI/CD Health Monitor', desc: 'Pull GitHub Actions history and visualize pass/fail trends across every workflow run.', bg: 'var(--teal-light)' },
          { icon: '🤖', title: 'AI QA Reports', desc: 'Mistral-powered natural language summaries of your repo health — exportable as PDF.', bg: 'var(--gold-light)' },
        ].map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(26,20,16,0.08)' }}
            style={{
              background: 'var(--warm-white)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24, cursor: 'default',
              transition: 'border-color 0.25s',
            }}
          >
            <div style={{ width: 36, height: 36, background: card.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>
              {card.icon}
            </div>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{card.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{card.desc}</div>
          </motion.div>
        ))}
      </section>

      {/* MARQUEE */}
      <div style={{ background: 'var(--ink)', padding: '14px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', animation: 'marquee 22s linear infinite' }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)',
              padding: '0 28px', fontWeight: 400, letterSpacing: '0.3px',
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              {item}
              <span style={{ color: 'var(--orange)', fontSize: 18 }}>·</span>
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
