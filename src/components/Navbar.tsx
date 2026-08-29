'use client'

import Link from 'next/link'
import { Video } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-[var(--background)]/70 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-xl group-hover:scale-105 transition-transform duration-300 border border-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <Video className="w-6 h-6 text-[var(--primary)] relative z-10" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/70 group-hover:from-[var(--primary)] group-hover:to-[var(--accent)] transition-all duration-300">
                Ngwambi
              </span>
            </Link>
          </div>
        </div>
      </nav>
  )
}
