import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/habits'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
  }

  // Build the redirect response first so we can set auth cookies directly on it.
  // If we used createServerSupabaseClient() (next/headers), cookies get set on an
  // internal response object that is NOT the NextResponse.redirect we return — meaning
  // the browser never sees the session cookies and every subsequent request looks unauthed.
  const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
  }

  // Upsert user profile (best-effort — don't block redirect on failure)
  await supabase.from('users').upsert({
    id: data.user.id,
    name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
    email: data.user.email!,
    avatar_url: data.user.user_metadata?.avatar_url ?? null,
  }, { onConflict: 'id' })

  return redirectResponse
}
