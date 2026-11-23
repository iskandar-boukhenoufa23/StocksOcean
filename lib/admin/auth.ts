import { createUserSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function requireAdmin() {
  const supabase = createUserSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?redirect=/admin')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || profile?.role !== 'admin') {
    redirect('/')
  }

  return user
}

export async function requireAdminAPI() {
  const supabaseUser = createUserSupabase()
  const {
    data: { user },
  } = await supabaseUser.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: Please log in')
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

export async function isAdmin(): Promise<boolean> {
  const supabase = createUserSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return profile?.role === 'admin'
}
