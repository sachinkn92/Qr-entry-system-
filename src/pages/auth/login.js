import { useState } from 'react'
import supabase from '../../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithGoogle() {
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin' } })
      if (error) throw error
    } catch (err) {
      setMessage(err.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  async function sendMagicLink(e) {
    e && e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/admin' } })
      if (error) throw error
      setMessage('Check your email for a sign-in link.')
    } catch (err) {
      setMessage(err.message || 'Magic link failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <div className="grid gap-4">
          <button onClick={signInWithGoogle} disabled={loading} className="bg-red-600 text-white py-2 px-4 rounded">Sign in with Google</button>

          <form onSubmit={sendMagicLink} className="grid gap-2">
            <label className="text-sm">Or sign in with email (magic link)</label>
            <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" />
            <button disabled={loading || !email} type="submit" className="bg-green-600 text-white py-2 px-4 rounded">Send Magic Link</button>
          </form>

          {message && <p className="text-green-700">{message}</p>}
        </div>
      </div>
    </div>
  )
}
