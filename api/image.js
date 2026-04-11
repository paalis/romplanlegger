export default async function handler(req, res) {
  const { url } = req.query
  if (!url || typeof url !== 'string') return res.status(400).end()

  try {
    const parsed = new URL(url)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': parsed.origin,
        'Accept': 'image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) throw new Error('Ikke et bilde')
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    const buffer = await response.arrayBuffer()
    res.send(Buffer.from(buffer))
  } catch {
    res.status(500).end()
  }
}
