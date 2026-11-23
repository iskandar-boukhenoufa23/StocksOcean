import { createUserSupabase } from '@/lib/supabaseServer'
import HomePageClient from '@/components/home/HomePageClient'
import type { Database } from '@/types/supabase'

type Asset = Pick<
  Database['public']['Tables']['assets']['Row'],
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

const ASSET_LIST_COLUMNS =
  'id,title,description,type,price,preview_path,storage_path,status,tags,contributor_id,profiles(username,avatar_url,role)'

export default async function HomePage() {
  const supabase = createUserSupabase()

  const [{ data: featuredAssets, error: assetsError }, { data: user }] =
    await Promise.all([
      supabase
        .from('assets')
        .select(ASSET_LIST_COLUMNS)
        .eq('status', 'approved')
        .order('views', { ascending: false })
        .limit(6),
      supabase.auth.getUser(),
    ])

  console.log("assetsError: ", assetsError);

  let isApprovedContributor = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    isApprovedContributor =
      profile?.role === 'contributor' || profile?.role === 'admin'
  }

  return (
    <HomePageClient
      featuredAssets={featuredAssets ?? []}
      isApprovedContributor={isApprovedContributor}
      error={assetsError?.message ?? null}
    />
  )
}
