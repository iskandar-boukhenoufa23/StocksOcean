import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

const protectedPrefixes = ['/admin', '/contributor', '/dashboard', '/favorites']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return res
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const pathname = req.nextUrl.pathname
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(
      new URL(`/auth/signin?redirect=${encodeURIComponent(pathname)}`, req.url),
    )
  }

  if (!user) {
    return res
  }

  const needsRoleCheck =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/contributor') ||
    pathname.startsWith('/become-contributor')

  if (!needsRoleCheck) {
    return res
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'user'

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/contributor') && !['admin', 'contributor'].includes(role)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/become-contributor') && role !== 'user') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/contributor/:path*',
    '/dashboard/:path*',
    '/favorites/:path*',
    '/become-contributor',
  ],
}
