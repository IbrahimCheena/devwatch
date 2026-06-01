'use client'

import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  color?: string
  delay?: number
  icon?: string
}

export function StatCard({ label, value, suffix = '', prefix = '', decimals = 0, color = 'var(--ink)', delay = 0, icon }: StatCardProps) {
  const counted = useCountUp(value, 1500, decimals)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>
        {prefix}{counted}{suffix}
      </div>
    </motion.div>
  )
}
