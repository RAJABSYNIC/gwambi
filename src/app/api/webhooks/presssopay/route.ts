import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost'
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const payload = await req.json()
    // Assume Pressso Pay sends { transactionId: '...', status: 'completed' | 'failed', reference: 'our-order-id' }
    
    console.log('Pressso Pay Webhook received:', payload)

    const orderId = payload.reference || payload.order_id
    const status = payload.status

    if (!orderId) {
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 })
    }

    if (status === 'completed' || status === 'success') {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', orderId)
    } else if (status === 'failed') {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'failed' })
        .eq('id', orderId)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
