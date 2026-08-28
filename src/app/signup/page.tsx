'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Video } from 'lucide-react'
import { signUpUser } from '@/app/actions/auth'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create user via server action to bypass RLS for profile creation
      const result = await signUpUser(phone, username, password)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // If successful, log them in immediately using the fake email trick
      const formattedPhone = phone.startsWith('+') ? phone : `+255${phone.replace(/^0/, '')}`
      const fakeEmail = `${formattedPhone.replace('+', '')}@ngwambi.com`
      
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password
      })

      if (loginError) {
        throw new Error('Akaunti imetengenezwa lakini imeshindwa kuingia moja kwa moja. Tafadhali ingia hapa.')
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Kuna tatizo limetokea. Tafadhali jaribu tena.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
            <Video className="w-10 h-10 text-[var(--primary)]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Tengeneza Akaunti Mpya
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--foreground)]/70">
          Au{' '}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:text-[var(--primary)]/80">
            ingia kama unayo akaunti
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--card)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--border)]">
          <form className="space-y-6" onSubmit={handleSignup}>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--foreground)]">
                Jina la Kutumia (Username)
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="mfano: Juma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 placeholder-[var(--foreground)]/50 focus:border-[var(--primary)] focus:outline-none focus:ring-[var(--primary)] sm:text-sm text-[var(--foreground)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)]">
                Namba ya Simu
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="07XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 placeholder-[var(--foreground)]/50 focus:border-[var(--primary)] focus:outline-none focus:ring-[var(--primary)] sm:text-sm text-[var(--foreground)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                Neno Siri / PIN
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 placeholder-[var(--foreground)]/50 focus:border-[var(--primary)] focus:outline-none focus:ring-[var(--primary)] sm:text-sm text-[var(--foreground)]"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-[var(--primary)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Inatengeneza...' : 'Jisajili'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
