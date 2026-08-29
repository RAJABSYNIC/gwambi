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
    <Link href={`/watch/${id}`} className="group block relative">
      {/* Glow Effect behind the card on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
      
      <div className="relative glass rounded-2xl overflow-hidden hover-shine flex flex-col h-full transform transition-all duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail_url}
            alt={title}
            className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-[var(--primary)]/90 backdrop-blur-sm text-white p-4 rounded-full shadow-[0_0_20px_var(--primary)] transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
              <Play className="w-8 h-8 fill-current" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium flex items-center gap-1 border border-white/10">
            <Play className="w-3 h-3" />
            {views_count} views
          </div>
        </div>
        
        <div className="p-4 flex-grow">
          <h3 className="text-[var(--foreground)] font-semibold text-base line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--primary)] group-hover:to-[var(--accent)] transition-all duration-300">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
