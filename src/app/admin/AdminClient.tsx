'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react'
import { addVideoAction, deleteVideoAction, editVideoAction } from '../actions/admin'

interface Video {
  id: string
  title: string
  description: string
  thumbnail_url: string
  drive_url: string
  category: string
  views_count: number
  created_at: string
}

export interface IncomeStats {
  today: number
  yesterday: number
  last7Days: number
  lastMonth: number
  lastYear: number
  lifetime: number
}

export default function AdminClient({ initialVideos, userId, stats }: { initialVideos: Video[], userId: string, stats: IncomeStats }) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [driveUrl, setDriveUrl] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId && !thumbnailFile) {
      setError('Tafadhali weka picha ya video (thumbnail).')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let thumbnailUrl = undefined

      if (thumbnailFile) {
        // 1. Upload thumbnail to ImgBB
        const formData = new FormData()
        formData.append('image', thumbnailFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadRes.json()
        
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Imeshindwa kupakia picha.')
        }

        thumbnailUrl = uploadData.url
      }

      if (editId) {
        // Edit existing video
        const result = await editVideoAction(editId, {
          title,
          description,
          category,
          driveUrl,
          thumbnailUrl
        })

        if (!result.success) {
          throw new Error(result.error || 'Imeshindwa kusasisha video kwenye database.')
        }

        setVideos(videos.map(v => v.id === editId ? result.data : v))
      } else {
        // Add new video
        const result = await addVideoAction({
          title,
          description,
          category,
          driveUrl,
          thumbnailUrl: thumbnailUrl!
        })

        if (!result.success) {
          throw new Error(result.error || 'Imeshindwa kupakia video kwenye database.')
        }

        setVideos([result.data, ...videos])
      }
      
      // Reset form
      handleCancelEdit()

    } catch (err: any) {
      setError(err.message || 'Kuna tatizo wakati wa kuhifadhi video.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (video: Video) => {
    setEditId(video.id)
    setTitle(video.title)
    setDescription(video.description)
    setCategory(video.category || '')
    setDriveUrl(video.drive_url)
    setThumbnailFile(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setTitle('')
    setDescription('')
    setCategory('')
    setDriveUrl('')
    setThumbnailFile(null)
    setError(null)
    const fileInput = document.getElementById('thumbnail') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Una uhakika unataka kufuta video hii?')) return

    try {
      const result = await deleteVideoAction(id)
      if (!result.success) {
        alert(result.error || 'Imeshindwa kufuta video.')
        return
      }
      
      setVideos(videos.filter(v => v.id !== id))
    } catch (err: any) {
      alert('Imeshindwa kufuta video.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin Panel</h1>
          <p className="text-[var(--foreground)]/70 mt-1">Ongeza na kudhibiti video zote hapa.</p>
        </div>
      </div>

      {/* Income Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Leo', value: stats.today },
          { label: 'Jana', value: stats.yesterday },
          { label: 'Siku 7 zilizopita', value: stats.last7Days },
          { label: 'Mwezi 1 uliopita', value: stats.lastMonth },
          { label: 'Mwaka 1 uliopita', value: stats.lastYear },
          { label: 'Jumla (Lifetime)', value: stats.lifetime },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-center items-center text-center">
            <p className="text-xs font-medium text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-[var(--primary)]">TZS {stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Video Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
              {editId ? <Edit className="w-5 h-5 text-[var(--accent)]" /> : <Plus className="w-5 h-5 text-[var(--primary)]" />}
              {editId ? 'Sasisha Video' : 'Ongeza Video Mpya'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Kichwa cha Video (Title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Maelezo (Description)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Aina (Category)</label>
                <input
                  type="text"
                  value={category}
                  placeholder="K.m Movie, Series, Bongo"
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Google Drive Share Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={driveUrl}
                  onChange={e => setDriveUrl(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Picha (Thumbnail)</label>
                <input
                  type="file"
                  id="thumbnail"
                  required={!editId}
                  accept="image/*"
                  onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-[var(--foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20"
                />
                {editId && <p className="text-xs text-[var(--foreground)]/50 mt-1">Acha wazi kama hutaki kubadilisha picha.</p>}
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center gap-2 bg-[var(--primary)] text-white py-2 px-4 rounded-md font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? 'Sasisha Video' : 'Pakia Video')}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] py-2 px-4 rounded-md font-medium hover:bg-[var(--background)]/70 transition-colors"
                  >
                    Katisha
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Video List */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--background)]/50">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Video Zilizopo ({videos.length})</h2>
            </div>
            
            <div className="divide-y divide-[var(--border)] max-h-[800px] overflow-y-auto">
              {videos.length === 0 ? (
                <div className="p-8 text-center text-[var(--foreground)]/50">
                  Hakuna video bado. Ongeza video yako ya kwanza!
                </div>
              ) : (
                videos.map(video => (
                  <div key={video.id} className="p-4 flex items-center justify-between hover:bg-[var(--background)]/30 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title} 
                        className="w-24 h-16 object-cover rounded-md bg-black"
                      />
                      <div>
                        <h3 className="font-medium text-[var(--foreground)] line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-[var(--foreground)]/60 flex gap-3 mt-1">
                          <span>👀 {video.views_count} views</span>
                          <span>{video.category || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditClick(video)}
                        className="p-2 text-blue-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                        title="Badilisha"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(video.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Futa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
