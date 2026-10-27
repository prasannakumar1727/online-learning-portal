import { Link } from 'react-router-dom'
import { Clock, Layers, User } from 'lucide-react'
import { Cover } from './ui'

export default function CourseCard({ course, enrolled, busy, onEnroll }) {
  return (
    <article className="card course-card">
      <Cover category={course.category} />
      <div className="card-body">
        <div className="chips"><span className="chip">{course.level}</span><span className="chip chip-muted">{course.category}</span></div>
        <h3><Link to={`/courses/${course.id}`}>{course.title}</Link></h3>
        <p className="muted clamp">{course.description}</p>
        <ul className="meta">
          <li><User size={15} aria-hidden="true" />{course.instructor}</li>
          <li><Clock size={15} aria-hidden="true" />{course.duration}</li>
          <li><Layers size={15} aria-hidden="true" />{course.lesson_count} lessons</li>
        </ul>
        <div className="actions">
          <Link className="btn btn-secondary" to={`/courses/${course.id}`}>View Course</Link>
          {enrolled
            ? <Link className="btn btn-primary" to="/dashboard">Enrolled · Open</Link>
            : <button className="btn btn-primary" onClick={() => onEnroll(course)} disabled={busy}>{busy ? 'Enrolling…' : 'Enroll'}</button>}
        </div>
      </div>
    </article>
  )
}
