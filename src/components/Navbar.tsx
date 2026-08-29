'use client'

import Link from 'next/link'
import { Video } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg group-hover:bg-[var(--primary)]/20 transition-colors">
                <Video className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">
                Ngwambi
              </span>
            </Link>
          </div>
        </div>
      </nav>

  )
}
