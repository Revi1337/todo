export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') ?? '/api/health'
  const cookie = request.headers.get('cookie') ?? ''

  const start = Date.now()
  const upstream = await fetch(`${process.env.BACKEND_URL}${path}`, {
    headers: { cookie },
  })
  const totalFetchTime = Date.now() - start

  const gcpTiming = upstream.headers.get('Server-Timing') ?? ''
  const gcpSupabase = parseFloat(gcpTiming.match(/db[^,]*dur=([\d.]+)/)?.[1] ?? '0')

  // 순수 Vercel <-> GCP 네트워크 소요 시간 계산
  const vercelGcpNetwork = Math.max(0, totalFetchTime - gcpSupabase)

  // Server-Timing 헤더 결합 (Append)
  const combinedTiming = gcpTiming 
    ? `${gcpTiming}, vercel-gcp;desc="Vercel-GCP";dur=${vercelGcpNetwork}`
    : `vercel-gcp;desc="Vercel-GCP";dur=${vercelGcpNetwork}`

  return Response.json({ vercelGcp: vercelGcpNetwork, gcpSupabase }, {
    headers: {
      'Server-Timing': combinedTiming
    }
  })
}
