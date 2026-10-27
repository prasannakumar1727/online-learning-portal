import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const close = () => setOpen(false)

  const onLogout = async () => {
    close()
    await logout()
    toast('You have been logged out.', 'info')
    navigate('/')
  }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand" onClick={close}><GraduationCap size={26} aria-hidden="true" /><span>Learning Portal</span></Link>
          <button className="icon-btn menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            <NavLink to="/" end onClick={close}>Courses</NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={close}>My Courses</NavLink>
                <span className="who">Hi, {user.name.split(' ')[0]}</span>
                <button className="btn btn-secondary btn-sm" onClick={onLogout}><LogOut size={16} aria-hidden="true" />Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={close}>Login</NavLink>
                <Link className="btn btn-primary btn-sm" to="/register" onClick={close}>Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="main" className="container main"><Outlet /></main>
      <footer className="footer">
        <div className="container">
          <span>© {new Date().getFullYear()} Learning Portal · Internship project</span>
          <Link to="/settings">Server settings</Link>
        </div>
      </footer>
    </>
  )
}
