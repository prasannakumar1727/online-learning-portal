import { AlertTriangle, BookOpen, Code2, Database, Globe, Loader2, RefreshCw } from 'lucide-react'
import { themeFor } from '../utils/course'

export function Spinner({ label = 'Loading…' }) {
  return <div className="state" role="status"><Loader2 className="spin" size={28} aria-hidden="true" /><p>{label}</p></div>
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <p>{error?.message || 'Something went wrong.'}</p>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}><RefreshCw size={16} aria-hidden="true" />Try again</button>}
    </div>
  )
}

export function EmptyState({ icon: Icon = BookOpen, title, children }) {
  return (
    <div className="state">
      <Icon size={32} aria-hidden="true" />
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export function ProgressBar({ percent, label }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Course progress'}>
      <div className={`progress-fill ${percent === 100 ? 'done' : ''}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

const ICONS = { code: Code2, globe: Globe, database: Database, book: BookOpen }
export function Cover({ category, size = 'md' }) {
  const t = themeFor(category)
  const Icon = ICONS[t.icon]
  return (
    <div className={`cover cover-${size}`} style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} aria-hidden="true">
      <span className="cover-ring r1" /><span className="cover-ring r2" />
      <Icon size={size === 'lg' ? 56 : 38} />
    </div>
  )
}
