import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import AdminClient from './AdminClient'
import PinLogin from './PinLogin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const hasPin = cookieStore.get('admin_pin')?.value === 'verified'

  if (!hasPin) {
    return <PinLogin />
  }

  // Fetch existing videos to list them
  const supabase = await createClient()
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminClient initialVideos={videos || []} userId="admin" />
}
