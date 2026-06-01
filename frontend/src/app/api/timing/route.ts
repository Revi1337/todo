export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') ?? '/api/health'
  const cookie = request.headers.get('cookie') ?? ''

  const start = Date.now()
  const upstream = await fetch(`${process.env.BACKEND_URL}${path}`, {
    headers: { cookie },
  })
  const vercelGcp = Date.now() - start

  const gcpTiming = upstream.headers.get('Server-Timing') ?? ''
  const gcpSupabase = parseFloat(gcpTiming.match(/db[^,]*dur=([\d.]+)/)?.[1] ?? '0')

  return Response.json({ vercelGcp, gcpSupabase })
}
