import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function Admin() {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 })

  useEffect(() => {
    let mounted = true
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        router.replace('/auth/login')
        return
      }
    }
    checkAuth()
    let channel = null

    async function fetchInitial() {
      setLoading(true)
      const { data } = await supabase.from('attendees').select('*').order('created_at', { ascending: false })
      setAttendees(data || [])
      updateStats(data || [])
      setLoading(false)
    }

    function updateStats(list) {
      const total = list.length
      const checkedIn = list.filter(x => x.used).length
      setStats({ total, checkedIn })
    }

    fetchInitial()

    channel = supabase.channel('public:attendees')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendees' }, (payload) => {
        // payload has { eventType, new, old }
        const ev = payload.eventType
        if (ev === 'INSERT') {
          setAttendees(prev => { const next = [payload.new, ...prev]; updateStats(next); return next })
        } else if (ev === 'UPDATE') {
          setAttendees(prev => { const next = prev.map(p => (p.id === payload.new.id ? payload.new : p)); updateStats(next); return next })
        } else if (ev === 'DELETE') {
          setAttendees(prev => { const next = prev.filter(p => p.id !== payload.old.id); updateStats(next); return next })
        }
      })
      .subscribe()

    return () => {
      if (channel) channel.unsubscribe()
      mounted = false
    }
  }, [])

  async function resend(attendeeId) {
    try {
      await fetch('/api/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: attendeeId }) })
      alert('Resend requested (check server logs or email)')
    } catch (err) {
      console.error(err)
      alert('Resend failed')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin — Attendees</h1>
      <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
        <div style={{ padding: 12, border: '1px solid #ddd' }}><strong>Total</strong><div>{stats.total}</div></div>
        <div style={{ padding: 12, border: '1px solid #ddd' }}><strong>Checked-in</strong><div>{stats.checkedIn}</div></div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>

      {loading ? <p>Loading attendees...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Event</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Checked-in</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 4px' }}>{a.name}</td>
                <td style={{ padding: '8px 4px' }}>{a.email}</td>
                <td style={{ padding: '8px 4px' }}>{a.event || a.event_id}</td>
                <td style={{ padding: '8px 4px' }}>{a.used ? new Date(a.used_at).toLocaleString() : '—'}</td>
                <td style={{ padding: '8px 4px' }}>
                  <button onClick={() => resend(a.id)}>Resend Ticket</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
