import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Only refresh the session
    await supabase.auth.getSession()
    
    return res
  } catch (e) {
    console.error('Middleware error:', e)
    return res
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
} 