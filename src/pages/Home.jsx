import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useFetch } from '../hooks/useFetch'
import CourseCard from '../components/CourseCard'
import { EmptyState, ErrorState, Spinner } from '../components/ui'

const LEVELS = ['All', 'Beginner', 'Intermediate']

export default function Home() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('All')
  const [busyId, setBusyId] = useState(null)

  const courses = useFetch(() => api.courses(), [])
  const mine = useFetch(() => (user ? api.myCourses() : Promise.resolve({ courses: [] })), [user?.id])
  const [justEnrolled, setJustEnrolled] = useState([])
  const enrolledIds = new Set([...(mine.data?.courses || []).map((c) => c.id), ...justEnrolled])

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (courses.data?.courses || []).filter((c) =>
      (level === 'All' || c.level === level) &&
      (!term || [c.title, c.description, c.instructor, c.category].some((s) => s.toLowerCase().includes(term))))
  }, [courses.data, q, level])

  const onEnroll = async (course) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname, notice: 'Log in to enroll in a course.' } })
      return
    }
    setBusyId(course.id)
    try {
      await api.enroll(course.id)
      setJustEnrolled((x) => [...x, course.id])
      toast(`Enrolled in “${course.title}”.`)
    } catch (e) {
      if (e.status === 409) { setJustEnrolled((x) => [...x, course.id]); toast(e.message, 'info') }
      else toast(e.message, 'error')
    } finally { setBusyId(null) }
  }

  return (
    <>
      <section className="hero">
        <h1>{user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Learn new skills, one lesson at a time.'}</h1>
        <p>Browse courses, enroll, study lessons and track your progress, all in one place.</p>
        <div className="search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, instructors, topics" aria-label="Search courses" />
        </div>
        <div className="chips" role="group" aria-label="Filter by level">
          {LEVELS.map((l) => (
            <button key={l} className={`chip chip-btn ${level === l ? 'active' : ''}`} aria-pressed={level === l} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
      </section>

      <section aria-labelledby="catalog-h">
        <h2 id="catalog-h">Course catalog</h2>
        {courses.loading && <Spinner label="Loading courses…" />}
        {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} />}
        {!courses.loading && !courses.error && list.length === 0 && (
          <EmptyState icon={SearchX} title={courses.data?.courses.length ? 'No courses match your search' : 'No courses available yet'}>
            {courses.data?.courses.length > 0 && <button className="btn btn-secondary" onClick={() => { setQ(''); setLevel('All') }}>Clear filters</button>}
          </EmptyState>
        )}
        <div className="grid">
          {list.map((c) => (
            <CourseCard key={c.id} course={c} enrolled={enrolledIds.has(c.id)} busy={busyId === c.id} onEnroll={onEnroll} />
          ))}
        </div>
      </section>
    </>
  )
}
