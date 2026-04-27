import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  const next = searchParams.get('next') ?? '/dashboard'

  if (next)
    console.log("Next URL from query params:", next);

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const redirectUrl = new URL(next, origin)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      if (forwardedHost && process.env.NODE_ENV !== 'development') {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }

      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}