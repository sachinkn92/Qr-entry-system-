import crypto from 'crypto'
import QRCode from 'qrcode'
import supabase from '../../lib/supabaseServer'
import sendEmailWithQr from '../../lib/email'

function sign(payload) {
  const secret = process.env.SECRET_KEY || 'dev_secret'
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64')
  const sig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url')
  return `${payloadStr}.${sig}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, event } = req.body || {}
  if (!name || !email || !event) return res.status(400).json({ error: 'Missing fields' })

  try {
    // find or create the event
    let { data: ev, error: evErr } = await supabase.from('events').select('id').eq('name', event).limit(1).maybeSingle()
    if (evErr) throw evErr

    if (!ev) {
      const { data: newEv, error: insetEvErr } = await supabase.from('events').insert({ name: event }).select().single()
      if (insetEvErr) throw insetEvErr
      ev = newEv
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex'))
    const payload = { id, name, email, event, createdAt: new Date().toISOString(), used: false }
    const token = sign(payload)

    // persist attendee
    const { data: attendee, error: attErr } = await supabase.from('attendees').insert({ id, name, email, event_id: ev.id, token }).select().maybeSingle()
    if (attErr) throw attErr

    // Generate QR as data URL
    const qrDataUrl = await QRCode.toDataURL(token)

    // Send confirmation email with QR attachment (SendGrid)
    try {
      await sendEmailWithQr(email, `Your ticket for ${event}`, `Hello ${name},\n\nThank you for registering for ${event}. Please find your QR ticket attached.`, qrDataUrl, token)
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
      // don't fail the registration if email sending fails; return a warning
    }

    res.status(200).json({ ok: true, qrDataUrl, token, attendee })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Registration failed' })
  }
}
