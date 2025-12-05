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
    <div className="container">
      <div className="flex items-start gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Admin — Attendees</h1>
        <div className="ml-auto">
          <button onClick={signOut} className="bg-gray-200 px-3 py-1 rounded">Sign out</button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="p-3 border rounded bg-white">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-lg font-medium">{stats.total}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-sm text-gray-500">Checked-in</div>
          <div className="text-lg font-medium">{stats.checkedIn}</div>
        </div>
      </div>

      {loading ? <p>Loading attendees...</p> : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Event</th>
                <th className="text-left p-3">Checked-in</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.event || a.event_id}</td>
                  <td className="p-3">{a.used ? new Date(a.used_at).toLocaleString() : '—'}</td>
                  <td className="p-3"><button onClick={() => resend(a.id)} className="text-sm text-blue-600">Resend</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
