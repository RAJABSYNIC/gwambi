import { createClient } from '@/utils/supabase/server'
import { VideoCard } from '@/components/VideoCard'

export default async function Home() {
  const supabase = await createClient()

  // Fetch videos ordered by newest first
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Video Mpya</h1>
        <p className="text-[var(--foreground)]/70 mt-2">
          Tazama video mbalimbali hapa Ngwambi.
        </p>
      </div>

      {error ? (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
          Kuna tatizo kupakia video. Tafadhali jaribu tena.
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail_url={video.thumbnail_url}
              views_count={video.views_count}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <p className="text-[var(--foreground)]/70">Hakuna video zozote zilizowekwa bado.</p>
        </div>
      )}
    </div>
  )
}
