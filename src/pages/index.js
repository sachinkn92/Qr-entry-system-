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
    <div className="container">
      <h1 className="text-2xl font-semibold mb-4">QR Entry System — Registration</h1>

      <form onSubmit={submit} className="grid gap-3 bg-white p-6 rounded shadow">
        <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-2 rounded" />
        <input required placeholder="Event name" value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} className="border p-2 rounded" />
        <button disabled={loading} type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">{loading ? 'Registering...' : 'Register'}</button>
      </form>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {qr && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium">Saved QR</h2>
          <img alt="QR code" src={qr} className="w-56 h-56 my-3" />
          <p className="text-sm text-gray-600">Save this QR or check your email for your ticket.</p>
        </div>
      )}

      <hr className="my-6" />
      <p className="text-sm">Admin pages: <a className="text-blue-600 underline" href="/admin">/admin</a> · Scanner: <a className="text-blue-600 underline" href="/scan">/scan</a> · <a className="text-blue-600 underline" href="/auth/login">Login</a></p>
    </div>
  )
}
