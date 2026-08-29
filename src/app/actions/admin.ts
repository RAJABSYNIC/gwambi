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
    cookieStore.set('admin_pin', 'verified', { secure: true, httpOnly: true })
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
  const cookieStore = await cookies()
  if (cookieStore.get('admin_pin')?.value !== 'verified') {
    throw new Error('Unauthorized')
  }

  const { data: video, error } = await supabaseAdmin
    .from('videos')
    .insert({
      title: data.title,
      description: data.description,
      category: data.category,
      drive_url: data.driveUrl,
      thumbnail_url: data.thumbnailUrl,
      created_by: '00000000-0000-0000-0000-000000000000' // dummy uuid or null if allowed
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return video
}

export async function deleteVideoAction(id: string) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_pin')?.value !== 'verified') {
    throw new Error('Unauthorized')
  }

  const { error } = await supabaseAdmin
    .from('videos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}
