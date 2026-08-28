import Link from 'next/link'
import { Play } from 'lucide-react'

interface VideoCardProps {
  id: string
  title: string
  thumbnail_url: string
  views_count: number
}

export function VideoCard({ id, title, thumbnail_url, views_count }: VideoCardProps) {
  return (
    <Link href={`/watch/${id}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail_url}
          alt={title}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[var(--primary)] text-white p-4 rounded-full transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
          {views_count} views
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-[var(--foreground)] font-semibold line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {title}
        </h3>
      </div>
    </Link>
  )
}
