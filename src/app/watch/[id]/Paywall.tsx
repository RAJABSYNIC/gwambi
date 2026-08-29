'use client'

import { useState, useEffect } from 'react'
import { Loader2, Phone, ShieldCheck } from 'lucide-react'

export default function Paywall({ videoId, guestId, price }: { videoId: string, guestId: string, price: number }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setError('Tafadhali weka namba ya simu iliyo sahihi (k.m. 0712345678).')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, phone, guestId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Imeshindwa kutuma ombi la malipo.')
      }

      setOrderId(data.orderId)
      setPolling(true)

    } catch (err: any) {
      setError(err.message || 'Kuna tatizo la mtandao, tafadhali jaribu tena.')
      setLoading(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (polling && orderId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/pay/status?orderId=${orderId}&guestId=${guestId}`)
          const data = await res.json()
          
          if (data.status === 'completed') {
            clearInterval(interval)
            // Reload page to show video
            window.location.reload()
          } else if (data.status === 'failed') {
            clearInterval(interval)
            setPolling(false)
            setLoading(false)
            setError('Malipo yameshindikana au yamekataliwa. Tafadhali jaribu tena.')
            setOrderId(null)
          }
        } catch (e) {
          console.error('Polling error:', e)
        }
      }, 3000) // Poll every 3 seconds
    }
    return () => clearInterval(interval)
  }, [polling, orderId, guestId])

  return (
    <div className="absolute inset-0 w-full h-full bg-black/90 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] p-8 rounded-2xl max-w-md w-full border border-[var(--border)] shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--accent)] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Lipia Kuangalia</h2>
          <p className="text-[var(--foreground)]/70 mt-2 text-sm">
            Video hii inauzwa kwa <strong>TZS {price}</strong> tu. Malipo hufanyika moja kwa moja kupitia simu yako.
          </p>
        </div>

        {!polling ? (
          <form onSubmit={handlePay} className="relative z-10 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Namba ya Simu</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
                <input
                  type="tel"
                  required
                  placeholder="0712345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 py-3 text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-[var(--primary)] text-white py-3 px-4 rounded-xl font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--primary)]/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lipa Sasa'}
            </button>
          </form>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center py-6 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
            <h3 className="text-lg font-medium text-[var(--foreground)]">Tunasubiria Malipo...</h3>
            <p className="text-sm text-[var(--foreground)]/60 text-center max-w-[250px]">
              Tafadhali weka namba ya siri (PIN) kwenye simu yako kuthibitisha malipo. Usifunge ukurasa huu.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
