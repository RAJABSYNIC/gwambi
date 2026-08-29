'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function verifyPin(pin: string) {
  if (pin === '9373') {
    const cookieStore = await cookies()
    cookieStore.set('admin_pin', 'verified', { secure: true, httpOnly: true, path: '/', sameSite: 'lax' })
    return { success: true }
  }
  return { success: false, error: 'PIN sio sahihi.' }
}

export async function addVideoAction(data: {
  title: string
  description: string
  category: string
  driveUrl: string
  thumbnailUrl: string
}) {
  try {
    const cookieStore = await cookies()
    if (cookieStore.get('admin_pin')?.value !== 'verified') {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        drive_url: data.driveUrl,
        thumbnail_url: data.thumbnailUrl,
        created_by: '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    // Serialize to prevent any hidden getters/dates from causing Error 441
    return { success: true, data: JSON.parse(JSON.stringify(video)) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Kuna tatizo.' }
  }
}

export async function deleteVideoAction(id: string) {
  try {
    const cookieStore = await cookies()
    if (cookieStore.get('admin_pin')?.value !== 'verified') {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Kuna tatizo.' }
  }
}
