import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ImgBB API key is missing' }, { status: 500 })
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')

    // Upload to ImgBB
    const imgbbFormData = new URLSearchParams()
    imgbbFormData.append('key', apiKey)
    imgbbFormData.append('image', base64Image)

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    })

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({ url: data.data.url })
    } else {
      return NextResponse.json({ error: data.error?.message || 'Failed to upload image' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
