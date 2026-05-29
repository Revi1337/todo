import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('JSESSIONID')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  if (!session) {
    if (isAuthPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 세션 쿠키가 있을 때 백엔드에서 유효성 검증
  try {
    const res = await fetch('http://localhost:8080/api/auth/me', {
      headers: { Cookie: `JSESSIONID=${session.value}` },
    })
    const data = await res.json()
    const authenticated = data?.data === true

    if (!authenticated && !isAuthPage) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('JSESSIONID')
      return response
    }

    if (authenticated && isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch {
    // 백엔드 연결 실패 시 통과 (로컬 개발 환경 고려)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
