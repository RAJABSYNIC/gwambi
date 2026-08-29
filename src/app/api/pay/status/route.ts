import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const guestId = searchParams.get('guestId')

    if (!orderId || !guestId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('status')
      .eq('id', orderId)
      .eq('guest_id', guestId)
      .single()

    if (error || !purchase) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ status: purchase.status })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
