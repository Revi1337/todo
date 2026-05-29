export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Error fetching data')
  }
  return data.data
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Error executing request')
  }
  return data.data
}
