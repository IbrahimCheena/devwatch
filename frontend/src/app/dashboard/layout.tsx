'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 150,
                background: 'rgba(26,20,16,0.55)',
                backdropFilter: 'blur(2px)',
              }}
            />
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 160, height: '100vh' }}
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="dashboard-main">
        {children}
      </main>

      <style>{`
        .sidebar-desktop { display: block; }
        .hamburger-btn { display: none; }
        .dashboard-main {
          margin-left: 220px;
          flex: 1;
          padding: 32px 40px;
          min-height: 100vh;
          max-width: 100%;
          overflow-x: hidden;
        }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
          .hamburger-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 14px;
            left: 14px;
            z-index: 100;
            background: var(--ink);
            color: var(--cream);
            border: none;
            border-radius: 10px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(26,20,16,0.2);
          }
          .dashboard-main {
            margin-left: 0 !important;
            padding: 72px 16px 40px !important;
          }
        }
      `}</style>
    </div>
  )
}
