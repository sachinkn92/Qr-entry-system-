import { useState } from 'react'

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', event: '' })
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setQr(null)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Registration failed')
      setQr(j.qrDataUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>QR Entry System — Registration</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input required placeholder="Event name" value={form.event} onChange={e=>setForm({...form, event:e.target.value})} />
        <button disabled={loading} type="submit">{loading ? 'Registering...' : 'Register'}</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {qr && (
        <div style={{ marginTop: 20 }}>
          <h2>Saved QR</h2>
          <img alt="QR code" src={qr} style={{ width: 220, height: 220 }} />
          <p>Save this QR or check your email (email sending is a stub in this scaffold).</p>
        </div>
      )}

      <hr style={{ margin: '24px 0' }} />
      <p>Admin pages: <a href="/admin">/admin</a> · Scanner: <a href="/scan">/scan</a></p>
    </div>
  )
}
