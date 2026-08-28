'use server'

import { createClient } from '@supabase/supabase-js'

export async function signUpUser(phone: string, username: string, password: string) {
  // Use service role key to bypass RLS for profile creation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const formattedPhone = phone.startsWith('+') ? phone : `+255${phone.replace(/^0/, '')}`
  const fakeEmail = `${formattedPhone.replace('+', '')}@ngwambi.com`

  try {
    // 1. Check if phone exists in profiles
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone_number', formattedPhone)
      .single()

    if (existingProfile) {
      return { error: 'Namba hii ya simu tayari inatumika.' }
    }

    // 2. Check username
    const { data: existingUsername } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return { error: 'Jina hili (username) tayari linatumika. Chagua lingine.' }
    }

    // 3. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: password,
      email_confirm: true // auto confirm email
    })

    if (authError || !authData.user) {
      return { error: authError?.message || 'Imeshindwa kutengeneza akaunti.' }
    }

    // 4. Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        phone_number: formattedPhone,
        role: 'user'
      })

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { error: 'Imeshindwa kuhifadhi taarifa zako. Tafadhali jaribu tena.' }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Tatizo limejitokeza.' }
  }
}
