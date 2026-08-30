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

  // Fetch completed purchases for stats
  const { data: purchases } = await supabase
    .from('purchases')
    .select('amount, created_at')
    .eq('status', 'completed')

  const now = new Date()
  const stats = {
    today: 0,
    yesterday: 0,
    last7Days: 0,
    lastMonth: 0,
    lastYear: 0,
    lifetime: 0
  }

  if (purchases) {
    const todayStr = now.toISOString().split('T')[0]
    const yesterdayDate = new Date(now)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0]
    
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const oneMonthAgo = new Date(now)
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const oneYearAgo = new Date(now)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    purchases.forEach(p => {
      const pDate = new Date(p.created_at)
      const pDateStr = pDate.toISOString().split('T')[0]
      const amount = p.amount || 0

      stats.lifetime += amount

      if (pDateStr === todayStr) stats.today += amount
      if (pDateStr === yesterdayStr) stats.yesterday += amount
      if (pDate >= sevenDaysAgo) stats.last7Days += amount
      if (pDate >= oneMonthAgo) stats.lastMonth += amount
      if (pDate >= oneYearAgo) stats.lastYear += amount
    })
  }

  return <AdminClient initialVideos={videos || []} userId="admin" stats={stats} />
}
