import supabase from '../../lib/supabaseServer'
import sendEmailWithQr from '../../lib/email'
import QRCode from 'qrcode'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.body || {}
  if (!id) return res.status(400).json({ error: 'Missing attendee id' })

  try {
    const { data: attendee, error: attErr } = await supabase.from('attendees').select('*').eq('id', id).maybeSingle()
    if (attErr) throw attErr
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' })

    // Generate QR data URL from stored token
    const qrDataUrl = await QRCode.toDataURL(attendee.token)

    // If you want event name, fetch events table
    let eventName = ''
    if (attendee.event_id) {
      const { data: ev } = await supabase.from('events').select('name').eq('id', attendee.event_id).maybeSingle()
      eventName = ev?.name || ''
    }

    await sendEmailWithQr(attendee.email, `Your ticket${eventName ? ` — ${eventName}` : ''}`, `Hello ${attendee.name},\n\nResending your ticket.`, qrDataUrl, attendee.token)

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Resend error', err)
    res.status(500).json({ error: err.message || 'Resend failed' })
  }
}
