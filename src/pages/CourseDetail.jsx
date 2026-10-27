import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, Lock, PlayCircle, User } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { Cover, ErrorState, ProgressBar, Spinner } from '../components/ui'

export default function CourseDetail() {
  const { id } = useParams()
  const { user, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const { data, loading, error, reload } = useFetch(() => (ready ? api.course(id) : new Promise(() => {})), [id, user?.id, ready])

  if (loading) return <Spinner label="Loading course…" />
  if (error) {
    return error.status === 404
      ? <div className="state"><h2>Course not found</h2><p className="muted">This course does not exist or was removed.</p><Link className="btn btn-primary" to="/">Browse courses</Link></div>
      : <ErrorState error={error} onRetry={reload} />
  }

  const course = data.course
  const prog = course.progress
  const done = new Set(prog?.completed_lesson_ids || [])
  const startId = prog?.next_lesson?.id ?? course.lessons[0]?.id

  const enroll = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname, notice: 'Log in to enroll in a course.' } })
    setBusy(true)
    try { await api.enroll(course.id); toast('Enrolled successfully. Happy learning!'); reload() }
    catch (e) { toast(e.message, e.status === 409 ? 'info' : 'error'); if (e.status === 409) reload() }
    finally { setBusy(false) }
  }

  return (
    <article>
      <Link to="/" className="back">← All courses</Link>
      <header className="course-head">
        <Cover category={course.category} size="lg" />
        <div>
          <div className="chips"><span className="chip">{course.level}</span><span className="chip chip-muted">{course.category}</span></div>
          <h1>{course.title}</h1>
          <p className="lead">{course.description}</p>
          <ul className="meta">
            <li><User size={15} aria-hidden="true" />{course.instructor}</li>
            <li><Clock size={15} aria-hidden="true" />{course.duration}</li>
            <li>{course.lessons.length} lessons</li>
          </ul>
          {course.enrolled ? (
            <>
              <div className="progress-line"><ProgressBar percent={prog.percent} /><span>{prog.percent}% · {prog.completed_lessons}/{prog.total_lessons} lessons</span></div>
              {startId && <Link className="btn btn-primary" to={`/lessons/${startId}`}><PlayCircle size={18} aria-hidden="true" />{prog.is_completed ? 'Review course' : prog.completed_lessons ? 'Continue Learning' : 'Start Learning'}</Link>}
            </>
          ) : (
            <button className="btn btn-primary" onClick={enroll} disabled={busy}>{busy ? 'Enrolling…' : 'Enroll in this course'}</button>
          )}
        </div>
      </header>

      <section aria-labelledby="lessons-h">
        <h2 id="lessons-h">Lessons</h2>
        {course.lessons.length === 0 && <p className="muted">Lessons for this course are coming soon.</p>}
        <ol className="lesson-list">
          {course.lessons.map((l) => (
            <li key={l.id}>
              {course.enrolled ? (
                <Link to={`/lessons/${l.id}`} className="lesson-row">
                  {done.has(l.id) ? <CheckCircle2 className="ok" size={20} aria-label="Completed" /> : <Circle size={20} aria-label="Not completed" />}
                  <span className="num">{l.lesson_order}</span><span>{l.title}</span>
                </Link>
              ) : (
                <button className="lesson-row locked" onClick={() => toast('Enroll to unlock the lessons.', 'info')}>
                  <Lock size={18} aria-hidden="true" /><span className="num">{l.lesson_order}</span><span>{l.title}</span>
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}
