import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/supabase'
import { getErrorMessage } from '@/lib/errors'

type Asset = Database['public']['Tables']['assets']['Row']
export type AssetListItem = Pick<
  Asset,
  | 'id'
  | 'title'
  | 'description'
  | 'type'
  | 'price'
  | 'preview_path'
  | 'storage_path'
  | 'status'
  | 'tags'
  | 'contributor_id'
> & {
  profiles?: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'username' | 'avatar_url' | 'role'
  > | null
}

interface UseAssetsOptions {
  filters?: {
    type?: string
    status?: string
    contributorId?: string
    category?: string
  }
  sortBy?: 'newest' | 'oldest' | 'trending'
  limit?: number
  offset?: number
}

const ASSET_LIST_COLUMNS =
  'id,title,description,type,price,preview_path,storage_path,status,tags,contributor_id,profiles(username,avatar_url,role)'

export function useAssets(options: UseAssetsOptions = {}) {
  const [assets, setAssets] = useState<AssetListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    filters,
    sortBy = 'newest',
    limit = 20,
    offset = 0,
  } = options

  const type = filters?.type
  const status = filters?.status
  const contributorId = filters?.contributorId
  const category = filters?.category

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('assets')
        .select(ASSET_LIST_COLUMNS)

      query = query.eq('status', status || 'approved')

      if (type && type !== 'all') {
        query = query.eq('type', type)
      }

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (contributorId) {
        query = query.eq('contributor_id', contributorId)
      }

      if (sortBy === 'trending') {
        query = query.order('views', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: sortBy === 'oldest' })
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error: queryError } = await query

      if (queryError) throw queryError
      setAssets(data ?? [])
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to fetch assets')
      setError(message)
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }, [category, contributorId, limit, offset, sortBy, status, type])

  useEffect(() => {
    void fetchAssets()
  }, [fetchAssets])

  return { assets, loading, error, refetch: fetchAssets }
}
