import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Eye, Clock } from 'lucide-react'
import { cookies } from 'next/headers'
import Paywall from './Paywall'

// Helper function kwa ajili ya kubadili Drive URL
function getEmbedUrl(driveUrl: string) {
  if (driveUrl.includes('/view')) {
    return driveUrl.replace(/\/view\?.*$/, '/preview')
  }
  return driveUrl
}

export const dynamic = 'force-dynamic'

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the video
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !video) {
    notFound()
  }

  // Increment views count (this ideally should be done via an RPC or API route to avoid blocking, 
  // but for simplicity we do it here since it's a server component)
  await supabase
    .from('videos')
    .update({ views_count: video.views_count + 1 })
    .eq('id', id)

  const embedUrl = getEmbedUrl(video.drive_url)

  // Check purchase status
  const cookieStore = await cookies()
  const guestId = cookieStore.get('guest_id')?.value
  
  let hasPurchased = false

  if (guestId) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('video_id', id)
      .eq('guest_id', guestId)
      .eq('status', 'completed')
      .single()
      
    if (purchase) {
      hasPurchased = true
    }
  }

  // Fallback if somehow guestId is missing (middleware should add it though)
  const safeGuestId = guestId || 'missing-guest-id'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] shadow-lg relative">
        
        {/* If not purchased, show the Paywall over the video area */}
        {!hasPurchased && (
          <Paywall videoId={id} guestId={safeGuestId} price={1000} />
        )}

        {/* Video Player (Google Drive iframe) */}
        <div className="relative w-full aspect-video bg-black">
          {hasPurchased ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay"
              allowFullScreen
            ></iframe>
          ) : (
            // Thumbnail as background for paywall
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30" 
              style={{ backgroundImage: `url(${video.thumbnail_url})` }}
            ></div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {video.title}
          </h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--foreground)]/70">
            <div className="flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)]">
              <Eye className="w-4 h-4" />
              <span>{video.views_count + 1} views</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 rounded-full border border-[var(--border)]">
              <Clock className="w-4 h-4" />
              <span>{new Date(video.created_at).toLocaleDateString('sw-TZ')}</span>
            </div>
            {video.category && (
              <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1.5 rounded-full font-medium">
                {video.category}
              </div>
            )}
          </div>

          {video.description && (
            <div className="mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
              <p className="text-[var(--foreground)] whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
