import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('Middleware path:', req.nextUrl.pathname)
    console.log('Session exists:', !!session)
    if (error) console.error('Session error:', error)

    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('Redirecting to home: No session found')
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (e) {
    console.error('Middleware error:', e)
    return res
  }
}

// Update matcher to only run on specific routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 