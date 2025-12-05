import crypto from 'crypto'
import supabase from '../../lib/supabaseServer'

function verify(signed) {
  const secret = process.env.SECRET_KEY || 'dev_secret'
  const parts = signed.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sig] = parts
  const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
  if (sig !== expected) return null
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
  return payload
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'Missing token' })

  try {
    const payload = verify(token)
    if (!payload) return res.status(400).json({ error: 'Invalid token' })

    const { data: attendee, error: attErr } = await supabase.from('attendees').select('*').eq('id', payload.id).maybeSingle()
    if (attErr) throw attErr
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' })
    if (attendee.used) return res.status(400).json({ error: 'Already used' })

    const { data: updated, error: updErr } = await supabase.from('attendees').update({ used: true, used_at: new Date().toISOString() }).eq('id', payload.id).select().maybeSingle()
    if (updErr) throw updErr

    res.status(200).json({ ok: true, attendee: updated || attendee })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Validation failed' })
  }
}
