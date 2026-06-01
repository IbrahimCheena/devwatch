'use client'

import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { User, Shield, Bell, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Manage your DevWatch account</p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <User size={16} color="var(--orange)" />
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Account</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {session?.user?.image && (
              <img src={session.user.image} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--border)' }} />
            )}
            <div>
              <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 15 }}>{session?.user?.name || 'GitHub User'}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>{session?.user?.email || 'Connected via GitHub OAuth'}</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Shield size={16} color="var(--teal)" />
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Connected Services</span>
          </div>
          {[
            { name: 'GitHub OAuth', status: 'Connected', color: 'var(--teal)' },
            { name: 'Supabase PostgreSQL', status: 'Connected', color: 'var(--teal)' },
            { name: 'HuggingFace Mistral', status: 'Connected', color: 'var(--teal)' },
            { name: 'Railway Backend', status: 'Live', color: 'var(--teal)' },
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>{s.name}</span>
              <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: 'var(--teal-light)', color: s.color }}>{s.status}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Bell size={16} color="var(--gold)" />
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>About DevWatch</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
            DevWatch is a full-stack GitHub analytics platform built with Java Spring Boot, Next.js, Python and PostgreSQL. AI reports are powered by Mistral 7B via HuggingFace free inference at zero API cost.
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <a href="https://github.com/IbrahimCheena/devwatch" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--orange)', textDecoration: 'none', fontWeight: 500 }}>
              View on GitHub →
            </a>
            <a href="https://devwatch-production.up.railway.app/swagger-ui.html" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>
              API Docs →
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--orange-light)', color: 'var(--orange)',
              border: '1px solid rgba(244,98,42,0.3)', borderRadius: 12, padding: '14px 0',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <LogOut size={16} />
            Sign Out of DevWatch
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
