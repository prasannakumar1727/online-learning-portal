import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error" id={`${id}-err`} role="alert">{error}</p>}
    </div>
  )
}

function PasswordInput({ id, value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      <button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const notice = location.state?.notice
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    if (!form.password) errs.password = 'Password is required.'
    setErrors(errs); setFormError('')
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await login(form.email.trim(), form.password)
      toast('Logged in successfully.')
      navigate(location.state?.from && location.state.from !== '/login' ? location.state.from : '/dashboard', { replace: true })
    } catch (err) { setFormError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <section className="auth card">
      <h1>Log in</h1>
      {notice && <p className="banner banner-info">{notice}</p>}
      {formError && <p className="banner banner-error" role="alert">{formError}</p>}
      <form onSubmit={submit} noValidate>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <PasswordInput id="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password" />
        </Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy && <Loader2 className="spin" size={16} aria-hidden="true" />}{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted center">New here? <Link to="/register">Create an account</Link></p>
    </section>
  )
}

export function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.'
    setErrors(errs); setFormError('')
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await api.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast('Account created. Please log in.')
      navigate('/login', { replace: true, state: { email: form.email.trim().toLowerCase() } })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally { setBusy(false) }
  }

  return (
    <section className="auth card">
      <h1>Create your account</h1>
      {formError && <p className="banner banner-error" role="alert">{formError}</p>}
      <form onSubmit={submit} noValidate>
        <Field id="name" label="Full name" error={errors.name}>
          <input id="name" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} />
        </Field>
        <Field id="password" label="Password (min 6 characters)" error={errors.password}>
          <PasswordInput id="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
        </Field>
        <Field id="confirm" label="Confirm password" error={errors.confirm}>
          <PasswordInput id="confirm" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
        </Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy && <Loader2 className="spin" size={16} aria-hidden="true" />}{busy ? 'Creating account…' : 'Register'}</button>
      </form>
      <p className="muted center">Already registered? <Link to="/login">Log in</Link></p>
    </section>
  )
}
