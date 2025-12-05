import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'

export default function Scan() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [manualToken, setManualToken] = useState('')
  const html5QrRef = useRef(null)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        router.replace('/auth/login')
        return
      }
    }
    checkAuth()

    return () => {
      if (html5QrRef.current && html5QrRef.current.stop) {
        html5QrRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function startScanner() {
    setResult(null)
    setScanning(true)
    try {
      const mod = await import('html5-qrcode')
      const { Html5Qrcode } = mod
      const qrRegionId = 'reader'
      const html5QrCode = new Html5Qrcode(qrRegionId)
      html5QrRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: { exact: 'environment' } },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          try { await html5QrCode.stop() } catch (e) {}
          html5QrRef.current = null
          setScanning(false)
          validateToken(decodedText)
        }
      )
    } catch (err) {
      console.error('Scanner start error', err)
      setResult({ ok: false, error: err.message || 'Camera not available' })
      setScanning(false)
    }
  }

  async function stopScanner() {
    if (html5QrRef.current && html5QrRef.current.stop) {
      try { await html5QrRef.current.stop() } catch (e) {}
      html5QrRef.current = null
    }
    setScanning(false)
  }

  async function validateToken(token) {
    setResult(null)
    try {
      const res = await fetch('/api/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Validation failed')
      setResult({ ok: true, attendee: j.attendee })
    } catch (err) {
      setResult({ ok: false, error: err.message })
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: '24px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Scanner (camera + manual)</h1>
      <p>Use your device camera to scan attendee QR codes. If camera access isn't available, paste the token manually.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div id="reader" style={{ width: '100%', maxWidth: 420, minHeight: 320, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!scanning ? <span style={{ color: '#666' }}>Camera preview</span> : null}
          </div>
          <div style={{ marginTop: 8 }}>
            {!scanning ? (
              <button onClick={startScanner}>Start Camera Scan</button>
            ) : (
              <button onClick={stopScanner}>Stop Scanner</button>
            )}
          </div>
        </div>
        <div style={{ width: 380 }}>
          <h3>Manual token input</h3>
          <textarea placeholder="paste token here" rows={6} value={manualToken} onChange={e => setManualToken(e.target.value)} style={{ width: '100%' }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => validateToken(manualToken)} disabled={!manualToken}>Validate</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.replace('/auth/login') }}>Sign out</button>
      </div>

      {result && (
        <div style={{ marginTop: 18 }}>
          {result.ok ? (
            <div>
              <h3 style={{ color: 'green' }}>Valid</h3>
              <pre style={{ background: '#f6f6f6', padding: 12 }}>{JSON.stringify(result.attendee, null, 2)}</pre>
            </div>
          ) : (
            <p style={{ color: 'crimson' }}>{result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}
