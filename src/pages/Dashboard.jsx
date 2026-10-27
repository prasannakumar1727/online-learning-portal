import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import { Cover, EmptyState, ErrorState, ProgressBar, Spinner } from '../components/ui'

export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetch(() => api.myCourses(), [])
  const courses = data?.courses || []
  const finished = courses.filter((c) => c.progress.is_completed).length

  return (
    <>
      <header className="page-head">
        <h1>Hello, {user.name.split(' ')[0]}</h1>
        <p className="muted">{courses.length ? `${courses.length} enrolled · ${finished} completed` : 'Your enrolled courses and progress appear here.'}</p>
      </header>
      {loading && <Spinner label="Loading your courses…" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && courses.length === 0 && (
        <EmptyState icon={BookOpen} title="You haven't enrolled in any courses yet">
          <p className="muted">Pick a course from the catalog to start learning.</p>
          <Link className="btn btn-primary" to="/">Browse courses</Link>
        </EmptyState>
      )}
      <div className="grid">
        {courses.map((c) => {
          const p = c.progress
          return (
            <article className="card course-card" key={c.id}>
              <Cover category={c.category} />
              <div className="card-body">
                <h3><Link to={`/courses/${c.id}`}>{c.title}</Link></h3>
                <p className="muted">{c.instructor} · {c.duration}</p>
                <ProgressBar percent={p.percent} label={`${c.title} progress`} />
                <p className="progress-text"><strong>{p.percent}%</strong> · {p.completed_lessons} of {p.total_lessons} lessons
                  {p.is_completed && <span className="chip chip-ok"><CheckCircle2 size={14} aria-hidden="true" />Completed</span>}</p>
                {p.next_lesson && <p className="muted small">Next: {p.next_lesson.title}</p>}
                <div className="actions">
                  {p.next_lesson
                    ? <Link className="btn btn-primary" to={`/lessons/${p.next_lesson.id}`}>{p.completed_lessons ? 'Continue' : 'Start'}</Link>
                    : <Link className="btn btn-secondary" to={`/courses/${c.id}`}>Review course</Link>}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
