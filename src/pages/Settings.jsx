import { useState } from 'react'
import { api, getApiBase, setApiBase } from '../services/api'
import { useToast } from '../hooks/useToast'

// Lets the Android app (or any browser) point at a reachable backend without rebuilding.
export default function Settings() {
  const toast = useToast()
  const [url, setUrl] = useState(getApiBase())
  const [status, setStatus] = useState(null)

  const test = async () => {
    setApiBase(url)
    setStatus('Testing…')
    try { await api.health(); setStatus('Connected: the server responded.') }
    catch (e) { setStatus(`Failed: ${e.message}`) }
  }
  const reset = () => { setApiBase(''); setUrl(getApiBase()); setStatus(null); toast('Server address reset to the default.', 'info') }

  return (
    <section className="auth card">
      <h1>Server settings</h1>
      <p className="muted">The address of the Learning Portal backend API. On a physical Android phone use your computer's Wi-Fi IP, for example http://192.168.1.20:5000. The Android emulator uses http://10.0.2.2:5000.</p>
      <div className="field">
        <label htmlFor="api">API address</label>
        <input id="api" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" autoCapitalize="none" />
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={() => { setApiBase(url); toast('Server address saved.') }}>Save</button>
        <button className="btn btn-secondary" onClick={test}>Save &amp; test</button>
        <button className="btn btn-secondary" onClick={reset}>Reset</button>
      </div>
      {status && <p role="status" className="banner banner-info">{status}</p>}
    </section>
  )
}
