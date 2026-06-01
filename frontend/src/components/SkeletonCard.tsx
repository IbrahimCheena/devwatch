export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div style={{
      height,
      borderRadius: 16,
      background: 'linear-gradient(90deg, var(--border) 25%, var(--warm-white) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  )
}
