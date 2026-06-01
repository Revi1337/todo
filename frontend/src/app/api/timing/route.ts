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
  const vercelTiming = `vercel_gcp;desc="Vercel-GCP";dur=${vercelGcp}`
  const serverTiming = gcpTiming ? `${gcpTiming}, ${vercelTiming}` : vercelTiming

  return new Response(null, {
    status: 204,
    headers: { 'Server-Timing': serverTiming },
  })
}
