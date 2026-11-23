import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabase } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getErrorMessage } from '@/lib/errors'

function getRemainingDownloads(downloadsUsed: number, downloadLimit: number) {
  return Math.max(downloadLimit - downloadsUsed, 0)
}

export async function POST(request: NextRequest) {
  try {
    const { assetId } = await request.json()

    if (typeof assetId !== 'string' || !assetId) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 })
    }

    const supabase = createUserSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        downloads_used,
        downloads_limit,
        price,
        subscription_plans (
          monthly_downloads
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: 'No active plan' }, { status: 403 })
    }

    const downloadLimit =
      subscription.downloads_limit ??
      subscription.subscription_plans?.monthly_downloads ??
      0

    const remaining = getRemainingDownloads(
      subscription.downloads_used,
      downloadLimit,
    )

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 403 },
      )
    }

    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id,storage_path,status')
      .eq('id', assetId)
      .eq('status', 'approved')
      .single()

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    if (!asset.storage_path) {
      return NextResponse.json({ error: 'File not available' }, { status: 404 })
    }

    const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
      .from('private_assets')
      .createSignedUrl(asset.storage_path, 60, { download: true })

    if (urlError || !signedUrl) {
      console.error('Could not generate download link:', urlError)
      return NextResponse.json(
        { error: 'Could not generate download link' },
        { status: 500 },
      )
    }

    const { error: rpcError } = await supabase.rpc('process_download_v2', {
      p_asset_id: assetId,
      p_downloads_limit: downloadLimit,
      p_price: subscription.price ?? 0,
      p_subscription_id: subscription.id,
      p_user_id: user.id,
    })

    if (rpcError) {
      console.error('Download processing failed:', rpcError)
      return NextResponse.json(
        { error: 'Could not process download' },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: signedUrl.signedUrl })
  } catch (error: unknown) {
    console.error('Download route error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Internal server error') },
      { status: 500 },
    )
  }
}
