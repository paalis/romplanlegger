import * as cheerio from 'cheerio'

export default async function handler(req, res) {
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
      signal: AbortSignal.timeout(9000),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    const $ = cheerio.load(html)
    const result = {}

    // 1. JSON-LD strukturdata
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

    // 3. Prøv å hente mål fra strukturerte nøkkel/verdi-par i HTML (dt/dd, tabeller, lister)
    if (!result.width || !result.depth) {
      extractFromKeyValueElements($, result)
    }

    // 4. Dimensjoner fra ren tekst (fallback)
    if (!result.width || !result.depth) {
      const measureText = $(
        '[class*="measurement"], [class*="dimension"], [class*="technical-spec"], [class*="product-detail"], [class*="spec"], dl, table'
      ).text()
      const bodyText = $('body').text()
      extractDimensions(measureText || bodyText, result)
    }

    // 5. Detekter L-form (sjeselong, chaiselong osv.)
    const bodyText = $('body').text()
    extractLShape((result.name || '') + ' ' + bodyText, result)

    // 6. Rydd opp i navn
    if (result.name) {
      result.name = result.name
        .replace(/\s*[-–|]\s*(IKEA\.com|IKEA|Skeidar|Bohus|Bolia|Ilva|Kid|Netthem|Møbelringen|Living).*/i, '')
        .trim()
    }

    if (result.price != null) {
      result.price = Math.round(parseFloat(String(result.price).replace(/[^0-9.,]/g, '').replace(',', '.')))
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Klarte ikke hente info fra siden' })
  }
}

// Henter mål fra dt/dd-par og tabellrader der nøkkel og verdi er i separate elementer
function extractFromKeyValueElements($, result) {
  const cm = (s) => Math.round((parseFloat(String(s).replace(',', '.')) / 100) * 100) / 100

  const WIDTH_KEYS  = /^(bredde|width|bredd|largeur|breedte)$/i
  const DEPTH_KEYS  = /^(dybde|depth|djupet|profondeur|diepte|dybde\s*\(D\))$/i
  const HEIGHT_KEYS = /^(høyde|height|höjd|hauteur|hoogte|høyde\s*\(H\))$/i

  const trySetDim = (key, val) => {
    const trimKey = key.trim()
    const numMatch = /(\d+[\.,]?\d*)\s*cm/i.exec(val) || /(\d+[\.,]?\d*)$/.exec(val.trim())
    if (!numMatch) return
    const v = cm(numMatch[1])
    if (WIDTH_KEYS.test(trimKey))  result.width  ??= v
    if (DEPTH_KEYS.test(trimKey))  result.depth  ??= v
    if (HEIGHT_KEYS.test(trimKey)) result.height ??= v
  }

  // dt/dd-par
  $('dl').each((_, dl) => {
    const children = $(dl).children().toArray()
    for (let i = 0; i < children.length - 1; i++) {
      const tag = children[i].tagName?.toLowerCase()
      if (tag === 'dt') {
        const key = $(children[i]).text().trim()
        const dd = children[i + 1]
        if (dd?.tagName?.toLowerCase() === 'dd') {
          trySetDim(key, $(dd).text())
        }
      }
    }
  })

  // Tabellrader: <tr><td>Nøkkel</td><td>Verdi</td></tr>
  $('tr').each((_, tr) => {
    const cells = $(tr).find('td, th').toArray()
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim()
      const val = $(cells[1]).text().trim()
      trySetDim(key, val)
    }
  })

  // Liste-elementer som inneholder målinformasjon: <li>Bredde: 120 cm</li>
  $('li, p, span').each((_, el) => {
    const text = $(el).text().trim()
    const m = /^(bredde|dybde|høyde|width|depth|height|bredd|djupet|höjd)[:\s]*(\d+[\.,]?\d*)\s*cm/i.exec(text)
    if (m) trySetDim(m[1], m[2] + ' cm')
  })
}

function extractLShape(text, result) {
  const clean = text.replace(/\s+/g, ' ')
  if (!/sjeselong|chaiselong|chaise\s*lounge|hjørnesofa/i.test(clean)) return

  result.shape = 'l-shape'

  const cm = (s) => Math.round((parseFloat(s.replace(',', '.')) / 100) * 100) / 100
  const tryMatch = (patterns) => {
    for (const p of patterns) {
      const m = new RegExp(p, 'gi').exec(clean)
      if (m) return cm(m[1])
    }
    return null
  }

  result.legW ??= tryMatch([
    'bredde\\s*sjeselong[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'sjeselong[\\s-]*bredde[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'lengde\\s*sjeselong[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'bredde\\s*chaiselong[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'chaise[\\s-]*bredde[:\\s]+([\\d][\\d.,]*)\\s*cm',
  ])

  result.legH ??= tryMatch([
    'dybde\\s*sofa[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'sofa[\\s-]*dybde[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'dybde\\s*u\\.?\\s*sjeselong[:\\s]+([\\d][\\d.,]*)\\s*cm',
    'dybde\\s*uten\\s*sjeselong[:\\s]+([\\d][\\d.,]*)\\s*cm',
  ])

  if (!result.legH) {
    const slash = /dybde[:\s]+(\d+[\.,]?\d*)\s*\/\s*(\d+[\.,]?\d*)\s*cm/gi.exec(clean)
    if (slash) {
      const d1 = parseFloat(slash[1].replace(',', '.'))
      const d2 = parseFloat(slash[2].replace(',', '.'))
      result.depth = Math.max(d1, d2) / 100
      result.legH = Math.min(d1, d2) / 100
    }
  }
}

function extractDimensions(text, result) {
  const clean = text.replace(/\s+/g, ' ')
  const cm = (s) => Math.round((parseFloat(s.replace(',', '.')) / 100) * 100) / 100

  // Format: "200 x 90 x 80 cm" eller "200×90×80cm" (B×D×H)
  if (!result.width || !result.depth || !result.height) {
    const xPat = /(\d+[\.,]?\d*)\s*[x×X]\s*(\d+[\.,]?\d*)\s*[x×X]\s*(\d+[\.,]?\d*)\s*cm/i
    const m = xPat.exec(clean)
    if (m) {
      result.width  ??= cm(m[1])
      result.depth  ??= cm(m[2])
      result.height ??= cm(m[3])
    }
  }

  // Format: "B: 120 cm / D: 80 cm / H: 75 cm"
  if (!result.width || !result.depth || !result.height) {
    const bPat = /\bB[:\s]*(\d+[\.,]?\d*)\s*cm/i.exec(clean)
    const dPat = /\bD[:\s]*(\d+[\.,]?\d*)\s*cm/i.exec(clean)
    const hPat = /\bH[:\s]*(\d+[\.,]?\d*)\s*cm/i.exec(clean)
    if (bPat) result.width  ??= cm(bPat[1])
    if (dPat) result.depth  ??= cm(dPat[1])
    if (hPat) result.height ??= cm(hPat[1])
  }

  const tryMatch = (patterns) => {
    for (const p of patterns) {
      const m = new RegExp(p, 'gi').exec(clean)
      if (m) return cm(m[1])
    }
    return null
  }

  result.width ??= tryMatch([
    'bredde[:\\s]*([\\d][\\d.,]*)\\s*cm',
    'width[:\\s]*([\\d][\\d.,]*)\\s*cm',
    'bredd[:\\s]*([\\d][\\d.,]*)\\s*cm',
  ])

  result.depth ??= tryMatch([
    'dybde[:\\s]*([\\d][\\d.,]*)\\s*cm',
    'depth[:\\s]*([\\d][\\d.,]*)\\s*cm',
    'djupet[:\\s]*([\\d][\\d.,]*)\\s*cm',
  ])

  result.height ??= tryMatch([
    'høyde[:\\s]*([\\d][\\d.,]*)\\s*cm',
    'height[:\\s]*([\\d][\\d.,]*)\\s*cm',
    'höjd[:\\s]*([\\d][\\d.,]*)\\s*cm',
  ])
}
