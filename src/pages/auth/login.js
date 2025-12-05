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
      // On success the browser is redirected to the provider
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
    <div style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Sign in</h1>
      <div style={{ display: 'grid', gap: 10 }}>
        <button onClick={signInWithGoogle} disabled={loading} style={{ padding: '8px 12px' }}>Sign in with Google</button>

        <form onSubmit={sendMagicLink} style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontSize: 14 }}>Or sign in with email (magic link)</label>
          <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <button disabled={loading || !email} type="submit">Send Magic Link</button>
        </form>

        {message && <p style={{ color: 'green' }}>{message}</p>}
      </div>
    </div>
  )
}
