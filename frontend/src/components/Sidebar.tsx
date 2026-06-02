'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, GitBranch, Activity, FileText, Settings, Zap, LogOut, Home } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: GitBranch, label: 'Repositories', href: '/dashboard/repos' },
  { icon: Activity, label: 'CI/CD', href: '/dashboard/cicd' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar({ onClose }: { onClose?: () => void } = {}) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--warm-white)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, paddingLeft: 8 }}>
        <motion.div
          animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 8, height: 8, background: 'var(--orange)', borderRadius: '50%' }}
        />
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
          DevWatch
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }} onClick={() => onClose?.()}>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: active ? 'var(--orange-light)' : 'transparent',
                  color: active ? 'var(--orange)' : 'var(--ink-muted)',
                  fontWeight: active ? 500 : 400, fontSize: 14, cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <Icon size={16} />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href="/" style={{ textDecoration: 'none' }} onClick={() => onClose?.()}>
          <motion.div
            whileHover={{ x: 4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            <Home size={16} />
            Home
          </motion.div>
        </Link>
        <motion.div
          whileHover={{ x: 4 }}
          onClick={() => { onClose?.(); signOut({ callbackUrl: '/', redirect: true }) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            color: 'var(--orange)', fontSize: 14, cursor: 'pointer',
            transition: 'color 0.2s',
          }}
        >
          <LogOut size={16} />
          Sign Out
        </motion.div>
        <div style={{ paddingLeft: 8, paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-muted)' }}>
            <Zap size={12} />
            Powered by Mistral AI
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
