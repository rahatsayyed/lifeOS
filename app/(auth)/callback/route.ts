import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/habits'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert user profile
      await supabase.from('users').upsert({
        id: data.user.id,
        name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
        email: data.user.email!,
        avatar_url: data.user.user_metadata?.avatar_url ?? null,
      }, { onConflict: 'id' })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
