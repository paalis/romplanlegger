import express from 'express'
import * as cheerio from 'cheerio'

const app = express()
const PORT = 3001

app.get('/api/scrape', async (req, res) => {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL mangler' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,en-US;q=0.5,en;q=0.3',
      },
      signal: AbortSignal.timeout(12000),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    const $ = cheerio.load(html)
    const result = {}

    // 1. JSON-LD strukturdata (fungerer bra på IKEA og mange andre butikker)
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      try {
        let data = JSON.parse($(el).html() || '')
        if (!Array.isArray(data)) data = [data]
        const flattened = data.flatMap((d) => (d['@graph'] ? d['@graph'] : [d]))
        const product = flattened.find((d) => d['@type'] === 'Product')
        if (!product) continue

        result.name ??= product.name
        result.brand ??= typeof product.brand === 'object' ? product.brand?.name : product.brand
        result.price ??= product.offers?.price ?? product.offers?.[0]?.price
        const img = product.image
        result.imageUrl ??= Array.isArray(img) ? img[0] : typeof img === 'string' ? img : img?.url

        if (product.description) extractDimensions(product.description, result)
      } catch {}
    }

    // 2. Open Graph-fallback
    result.name ??= $('meta[property="og:title"]').attr('content') || $('title').text()?.trim()
    result.imageUrl ??= $('meta[property="og:image"]').attr('content')

    if (!result.price) {
      const amount = $('meta[property="product:price:amount"]').attr('content')
      if (amount) result.price = parseFloat(amount)
    }

    // 3. Dimensjoner fra HTML (prøver måltabeller/lister, faller tilbake til all tekst)
    if (!result.width || !result.depth) {
      const measureText = $(
        '[class*="measurement"], [class*="dimension"], [class*="technical-spec"], [class*="product-detail"], dl, table'
      ).text()
      extractDimensions(measureText || $('body').text(), result)
    }

    // 4. Rydd opp i navn (fjern butikknavn etter bindestrek/pipe)
    if (result.name) {
      result.name = result.name
        .replace(/\s*[-–|]\s*(IKEA\.com|IKEA|Skeidar|Bohus|Bolia|Ilva|Kid|Netthem|Møbelringen|Living).*/i, '')
        .trim()
    }

    // Konverter pris til tall
    if (result.price != null) {
      result.price = Math.round(parseFloat(String(result.price).replace(/[^0-9.,]/g, '').replace(',', '.')))
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Klarte ikke hente info fra siden' })
  }
})

function extractDimensions(text, result) {
  const clean = text.replace(/\s+/g, ' ')

  const tryMatch = (patterns) => {
    for (const p of patterns) {
      const m = new RegExp(p, 'gi').exec(clean)
      if (m) return Math.round((parseFloat(m[1].replace(',', '.')) / 100) * 100) / 100
    }
    return null
  }

  result.width ??= tryMatch([
    'bredde[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'width[:\\s]+([\\d][\\d.,]*)\\s*cm',
    '\\bB[:\\s]+([\\d][\\d.,]*)\\s*cm',
  ])

  result.depth ??= tryMatch([
    'dybde[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'depth[:\\s]+([\\d][\\d.,]*)\\s*cm',
    '\\bD[:\\s]+([\\d][\\d.,]*)\\s*cm',
  ])

  result.height ??= tryMatch([
    'høyde[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'height[:\\s]+([\\d][\\d.,]*)\\s*cm',
    '\\bH[:\\s]+([\\d][\\d.,]*)\\s*cm',
  ])
}

app.listen(PORT, () => console.log(`Møbelskraper kjører på http://localhost:${PORT}`))
