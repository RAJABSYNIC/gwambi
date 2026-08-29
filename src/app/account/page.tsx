import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">Akaunti Yangu</h1>
        
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Taarifa za Msingi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70">Namba ya Simu</label>
                <div className="mt-1 text-lg text-[var(--foreground)]">
                  {profile?.phone || user.email?.replace('@ngwambi.com', '') || 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70">Aina ya Akaunti</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                    {profile?.role === 'admin' ? 'Admin' : 'Mtazamaji'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70">Tarehe ya Kujiunga</label>
                <div className="mt-1 text-[var(--foreground)]">
                  {new Date(user.created_at).toLocaleDateString('sw-TZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
