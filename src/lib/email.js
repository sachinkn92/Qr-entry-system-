import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com'

let transporter = null
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })
} else {
  console.warn('SMTP not fully configured — emails will be logged to the console')
}

async function sendEmailWithQr(to, subject, text, qrDataUrl, token) {
  if (!transporter) {
    console.log('Email stub: to=', to)
    console.log('Subject:', subject)
    console.log('Text:', text)
    console.log('Token:', token)
    console.log('QR DataURL length:', qrDataUrl ? qrDataUrl.length : 0)
    return { ok: false, stub: true }
  }

  const base64 = qrDataUrl.replace(/^data:image\/\w+;base64,/, '')

  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    text: `${text}\n\nToken: ${token}`,
    html: `<p>${text}</p><p><strong>Token:</strong> <code>${token}</code></p>`,
    attachments: [
      {
        filename: 'ticket.png',
        content: Buffer.from(base64, 'base64'),
        contentType: 'image/png'
      }
    ]
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { ok: true, info }
  } catch (err) {
    console.error('SMTP send error:', err)
    throw err
  }
}

export default sendEmailWithQr
