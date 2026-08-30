import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost'
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const payload = await req.json()
    // Haraka Pay webhook payload: { order_id: '...', status: 'completed' | 'failed' }
    
    console.log('Haraka Pay Webhook received:', payload)

    const orderId = payload.order_id
    const status = payload.status

    // The order_id from Haraka Pay is usually their own ID. If we passed our purchase ID in the webhook URL or if they return it.
    // Wait, in our /api/pay we didn't pass order_id in Haraka Pay's API except maybe in description. 
    // Actually, we saved Haraka's `order_id` in our `order_reference` column!
    
    if (!orderId) {
      return NextResponse.json({ error: 'No order_id provided' }, { status: 400 })
    }

    if (status === 'completed' || status === 'success') {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'completed' })
        .eq('order_reference', orderId)
    } else if (status === 'failed') {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'failed' })
        .eq('order_reference', orderId)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
