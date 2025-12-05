import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Account() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        router.replace('/auth/login')
        return
      }
      const u = data.session.user
      setUser(u)
      setName(u.user_metadata?.full_name || '')
      setLoading(false)
    }
    load()
  }, [])

  async function updateProfile(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: name } })
      if (error) throw error
      setUser(data.user)
      alert('Profile updated')
    } catch (err) {
      alert(err.message || 'Update failed')
    } finally { setLoading(false) }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  if (loading) return <div className="container">Loading...</div>

  return (
    <div className="container">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Your account</h2>
        <p className="text-sm text-gray-600">Email: {user.email}</p>

        <form onSubmit={updateProfile} className="mt-4 grid gap-3">
          <label className="text-sm">Full name</label>
          <input className="border p-2 rounded" value={name} onChange={e => setName(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white py-2 px-4 rounded" disabled={loading} type="submit">Save</button>
            <button className="bg-gray-200 py-2 px-4 rounded" onClick={signOut} type="button">Sign out</button>
          </div>
        </form>
      </div>
    </div>
  )
}
