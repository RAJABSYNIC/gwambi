'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-center text-sm font-medium bg-[var(--primary)] text-white px-4 py-3 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
    >
      Toka (Sign Out)
    </button>
  )
}
