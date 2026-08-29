import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

const PRESSSO_API_KEY = process.env.NEXT_PUBLIC_PRESSSO_PAY_KEY
const HARAKA_API_KEY = 'hpk_2956fec8e3e5f80597bb59c734275096e99a6e6628046826'

export async function POST(req: Request) {
  try {
    const { videoId, phone, guestId } = await req.json()
    const supabase = await createClient()

    if (!videoId || !phone || !guestId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Amount is 1000 TZS per video
    const amount = 1000

    // 1. Create a purchase record with 'pending' status
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        video_id: videoId,
        guest_id: guestId,
        phone_number: phone,
        amount: amount,
        status: 'pending'
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const orderId = purchase.id

    // 2. Try Pressso Pay first (Primary)
    // Assuming a hypothetical Pressso Pay API based on standard structures
    let gatewayUsed = 'pressso'
    let orderRef = null
    let presssoSuccess = false

    try {
      const presssoRes = await fetch('https://api.pressopay.com/v1/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PRESSSO_API_KEY}` // Or whatever header they use
        },
        body: JSON.stringify({
          phone: phone,
          amount: amount,
          reference: orderId,
          callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/pressopay`
        }),
        signal: AbortSignal.timeout(5000) // 5s timeout
      })
      
      const presssoData = await presssoRes.json()
      if (presssoRes.ok && presssoData.success) {
        presssoSuccess = true
        orderRef = presssoData.transactionId || presssoData.order_id
      }
    } catch (e) {
      console.error('Pressso Pay failed immediately:', e)
      presssoSuccess = false
    }

    // 3. Fallback to Haraka Pay if Pressso failed
    if (!presssoSuccess) {
      console.log('Falling back to Haraka Pay...')
      gatewayUsed = 'haraka'
      
      try {
        const harakaRes = await fetch('https://harakapay.net/api/v1/collect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': HARAKA_API_KEY
          },
          body: JSON.stringify({
            phone: phone,
            amount: amount,
            description: `Malipo ya Video`,
            webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ngwambi.vercel.app'}/api/webhooks/harakapay`
          })
        })
        
        const harakaData = await harakaRes.json()
        
        if (!harakaRes.ok || !harakaData.success) {
          throw new Error(harakaData.message || 'Haraka Pay API Error')
        }
        
        orderRef = harakaData.order_id
        
      } catch (e: any) {
        console.error('Haraka Pay also failed:', e)
        return NextResponse.json({ error: 'Mitandao ya malipo inasumbua kwa sasa. Jaribu tena baadae.' }, { status: 500 })
      }
    }

    // 4. Update the purchase record with the gateway used and reference
    await supabase
      .from('purchases')
      .update({ gateway_used: gatewayUsed, order_reference: orderRef })
      .eq('id', orderId)

    return NextResponse.json({ success: true, orderId, gatewayUsed })

  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
