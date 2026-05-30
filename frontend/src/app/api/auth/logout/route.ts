import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const session = cookieStore.get('JSESSIONID')

  if (session) {
    try {
      await fetch(`${process.env.BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: `JSESSIONID=${session.value}` },
      })
    } catch { /* ignore */ }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('JSESSIONID', '', { maxAge: 0, path: '/' })
  return response
}
