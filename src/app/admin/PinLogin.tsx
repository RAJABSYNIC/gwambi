'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPin } from '../actions/admin'

export default function PinLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await verifyPin(pin)
      if (res.success) {
        router.refresh()
      } else {
        setError(res.error || 'PIN si sahihi')
      }
    } catch (err) {
      setError('Tatizo limetokea. Jaribu tena.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="bg-[var(--card)] p-8 rounded-2xl shadow-lg border border-[var(--border)] max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Ingiza PIN..."
              required
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full text-center text-2xl tracking-widest rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Inatafuta...' : 'Ingia'}
          </button>
        </form>
      </div>
    </div>
  )
}
