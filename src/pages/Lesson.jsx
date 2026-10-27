import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, PartyPopper } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import { ErrorState, ProgressBar, Spinner } from '../components/ui'
import { LessonContent } from '../utils/content'

export default function Lesson() {
  const { id } = useParams()
  const toast = useToast()
  const { data, loading, error, reload, setData } = useFetch(() => api.lesson(id), [id])
  const [busy, setBusy] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (loading) return <Spinner label="Loading lesson…" />
  if (error) {
    if (error.status === 403) {
      return <div className="state"><h2>Enrollment required</h2><p className="muted">{error.message}</p><Link className="btn btn-primary" to="/">Browse courses</Link></div>
    }
    if (error.status === 404) return <div className="state"><h2>Lesson not found</h2><Link className="btn btn-primary" to="/">Browse courses</Link></div>
    return <ErrorState error={error} onRetry={reload} />
  }

  const l = data.lesson
  const p = l.progress

  const complete = async () => {
    setBusy(true)
    try {
      const r = await api.complete(l.id)
      setData({ lesson: { ...l, completed: true, progress: r.progress } })
      toast(r.progress.is_completed ? 'Course completed. Congratulations!' : 'Lesson marked complete.')
    } catch (e) { toast(e.message, 'error') }
    finally { setBusy(false) }
  }

  return (
    <article className="lesson">
      <Link to={`/courses/${l.course_id}`} className="back"><ArrowLeft size={16} aria-hidden="true" />{l.course_title}</Link>
      <div className="progress-line"><ProgressBar percent={p.percent} /><span>{p.percent}% · {p.completed_lessons}/{p.total_lessons} lessons</span></div>
      <p className="eyebrow">Lesson {l.lesson_order} of {p.total_lessons}</p>
      <h1>{l.title} {l.completed && <span className="chip chip-ok"><CheckCircle2 size={14} aria-hidden="true" />Completed</span>}</h1>
      <div className="prose"><LessonContent text={l.content} /></div>

      {p.is_completed && (
        <div className="banner" role="status"><PartyPopper size={22} aria-hidden="true" />You have completed every lesson in this course.
          <Link to="/dashboard">Go to My Courses</Link></div>
      )}

      <div className="lesson-nav">
        {l.previous_lesson_id
          ? <Link className="btn btn-secondary" to={`/lessons/${l.previous_lesson_id}`}><ArrowLeft size={16} aria-hidden="true" />Previous</Link>
          : <span />}
        <button className="btn btn-primary" onClick={complete} disabled={busy || l.completed}>
          <CheckCircle2 size={18} aria-hidden="true" />{l.completed ? 'Completed' : busy ? 'Saving…' : 'Mark Complete'}
        </button>
        {l.next_lesson_id
          ? <Link className="btn btn-secondary" to={`/lessons/${l.next_lesson_id}`}>Next<ArrowRight size={16} aria-hidden="true" /></Link>
          : <span />}
      </div>
    </article>
  )
}
