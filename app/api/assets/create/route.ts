import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createUserSupabase } from '@/lib/supabaseServer'
import { getErrorMessage } from '@/lib/errors'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024
const VALID_TYPES = new Set(['image', 'video', '3d', 'other'])

export async function POST(request: NextRequest) {
  try {
    const supabase = createUserSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload assets.' },
        { status: 401 },
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: 'Could not verify contributor permissions' },
        { status: 500 },
      )
    }

    if (!profile || !['contributor', 'admin'].includes(profile.role ?? '')) {
      return NextResponse.json(
        { error: 'Forbidden. Only approved contributors can upload assets.' },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const fileValue = formData.get('file')
    const title = formData.get('title')
    const description = formData.get('description')
    const type = formData.get('type')
    const license = formData.get('license')
    const category = formData.get('category')
    const tagsValue = formData.get('tags')

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (fileValue.size <= 0 || fileValue.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: 'File size must be between 1 byte and 50 MB' },
        { status: 400 },
      )
    }

    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title must be a non-empty string' },
        { status: 400 },
      )
    }

    if (typeof type !== 'string' || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { error: 'Invalid asset type' },
        { status: 400 },
      )
    }

    if (typeof license !== 'string' || !license.trim()) {
      return NextResponse.json(
        { error: 'License is required' },
        { status: 400 },
      )
    }

    let tags: string[] = []
    if (typeof tagsValue === 'string' && tagsValue.trim()) {
      try {
        const parsedTags: unknown = JSON.parse(tagsValue)

        if (!Array.isArray(parsedTags) || !parsedTags.every((tag) => typeof tag === 'string')) {
          return NextResponse.json(
            { error: 'Tags must be an array of strings' },
            { status: 400 },
          )
        }

        tags = parsedTags.map((tag) => tag.trim()).filter(Boolean)
      } catch {
        return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 })
      }
    }

    const pathPrefix = profile.role === 'admin' ? 'admin' : `contributors/${user.id}`
    const safeFilename = fileValue.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${Date.now()}-${safeFilename}`
    const originalPath = `${pathPrefix}/${filename}`

    const buffer = Buffer.from(await fileValue.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('private_assets')
      .upload(originalPath, buffer, {
        contentType: fileValue.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload asset' },
        { status: 500 },
      )
    }

    let previewUrl: string | null = null
    let previewPath: string | null = null

    if (type === 'image') {
      previewPath = `${pathPrefix}/previews/${filename}`
      const previewBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer()

      const { error: previewError } = await supabase.storage
        .from('assets')
        .upload(previewPath, previewBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (!previewError) {
        previewUrl = supabase.storage
          .from('assets')
          .getPublicUrl(previewPath).data.publicUrl
      }
    }

    const { data: insertedAsset, error: insertError } = await supabase
      .from('assets')
      .insert({
        contributor_id: user.id,
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() || null : null,
        type,
        storage_path: originalPath,
        preview_path: previewUrl,
        price: 0,
        license: license.trim(),
        status: 'pending',
        tags: tags.length > 0 ? tags : null,
        category: typeof category === 'string' && category ? category : null,
        views: 0,
        downloads: 0,
      })
      .select('id')
      .single()

    if (insertError || !insertedAsset) {
      console.error('Database insert error:', insertError)

      await Promise.all([
        supabase.storage.from('private_assets').remove([originalPath]),
        previewPath
          ? supabase.storage.from('assets').remove([previewPath])
          : Promise.resolve({ data: null, error: null }),
      ])

      return NextResponse.json(
        { error: 'Failed to create asset record' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        assetId: insertedAsset.id,
        message: 'Asset created successfully',
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Unexpected error in /api/assets/create:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development'
            ? getErrorMessage(error)
            : undefined,
      },
      { status: 500 },
    )
  }
}
