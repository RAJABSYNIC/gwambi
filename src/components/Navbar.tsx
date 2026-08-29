'use client'

import Link from 'next/link'
import { Video, Home, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
  }, [pathname, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <>
      {/* Top Header */}
      <nav className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-[var(--primary)]/10 rounded-lg group-hover:bg-[var(--primary)]/20 transition-colors">
                  <Video className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">
                  Ngwambi
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors px-4 py-2 rounded-lg hover:bg-[var(--card)]"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md z-50 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-6">
          <Link 
            href="/" 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              pathname === '/' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          
          <Link 
            href={user ? "/account" : "/login"} 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              pathname === '/account' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </div>
      </div>
    </>
  )
}
