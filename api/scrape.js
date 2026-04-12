import * as cheerio from 'cheerio'

// Kategorier som samsvarer med app-en sine ALT_CATEGORIES
const CATEGORY_MAP = [
  { match: /sofa|sjeselong|chaiselong|hjørnesofa|2.seter|3.seter|4.seter/i, label: 'Sofa' },
  { match: /stol|lenestol|kontorstoler|sittegruppe/i,                        label: 'Stol' },
  { match: /bord|spisebord|sofabord|stuebord|skrivebord|sidebord|salongbord/i, label: 'Bord' },
  { match: /seng|dobbeltseng|enkeltseng|kontinentalseng|boxspring/i,          label: 'Seng' },
  { match: /skap|garderobe|kommode|dresser/i,                                 label: 'Skap' },
  { match: /hylle|bokhylle|vegghy/i,                                          label: 'Hylle' },
  { match: /lampe|belysning|taklampe|gulvlampe|bordlampe|lysekrone/i,         label: 'Belysning' },
  { match: /kjøkken|kjoekken|kitchen/i,                                       label: 'Kjøkken' },
  { match: /bad|baderom|bathroom/i,                                           label: 'Bad' },
  { match: /tv.benk|tv.møbel|tv.bord|mediamøbel/i,                           label: 'TV-møbel' },
  { match: /hage|ute|balkong|terrasse|outdoor/i,                              label: 'Utemøbel' },
]

const COLOR_MAP = [
  { match: /svart|black/i,                               hex: '#2a2a2a' },
  { match: /hvit|white|offwhite|kritt|chalk/i,           hex: '#f0ede8' },
  { match: /grå|gr[aå]|grey|gray|antrasitt|anthracite/i, hex: '#888884' },
  { match: /beige|natur|sand|krem|cream/i,               hex: '#c8b898' },
  { match: /brun|brown|cognac|kaffe|coffee|terrakotta/i, hex: '#8B6B4A' },
  { match: /blå|blue|navy|petrol|indigo|denim/i,         hex: '#5a7a9e' },
  { match: /grønn|green|oliv|sage|forest/i,              hex: '#6b8b6b' },
  { match: /rød|red|bordeaux|rubin|rust/i,               hex: '#9b4444' },
  { match: /rosa|pink|gammelrosa|dusty.?pink/i,          hex: '#c89898' },
  { match: /gul|yellow|okker|mustard/i,                  hex: '#c8a94e' },
  { match: /oransje|orange|terracotta/i,                 hex: '#c8824e' },
  { match: /lilla|purple|fiolett|lavendel/i,             hex: '#8b6bae' },
  { match: /turkis|teal|petrol|mint/i,                   hex: '#6b9b9b' },
  { match: /eik|oak|tre|wood|valnøtt|walnut/i,           hex: '#a07850' },
]

function mapColor(colorName) {
  if (!colorName) return null
  for (const { match, hex } of COLOR_MAP) {
    if (match.test(colorName)) return hex
  }
  return null
}

function mapCategory(categories) {
  for (const cat of categories) {
    for (const { match, label } of CATEGORY_MAP) {
      if (match.test(cat)) return label
    }
  }
  return null
}

// --- Bohus-spesifikk GraphQL-henting ---
async function fetchBohus(url) {
  // URL kan slutte med numerisk SKU (f.eks. /310820/) eller slug (f.eks. /berlin-kontinentalseng-150x200)
  const pathSegments = url.replace(/\/$/, '').split('/').filter(Boolean)
  const lastSegment = pathSegments[pathSegments.length - 1]

  const skuMatch = lastSegment.match(/^(\d{4,7})$/)
  const filter = skuMatch
    ? `sku: {eq: "${skuMatch[1]}"}`
    : `url_key: {eq: "${lastSegment}"}`

  const query = `{
    products(filter: {${filter}}) {
      items {
        name
        sku
        price_range { minimum_price { regular_price { value } } }
        image { url }
        categories { name }
        custom_attributes {
          attribute_metadata { code label }
          entered_attribute_value { value }
          selected_attribute_options { attribute_option { label } }
        }
      }
    }
  }`

  const res = await fetch('https://checkout.bohus.no/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(9000),
  })
  if (!res.ok) throw new Error(`Bohus GraphQL HTTP ${res.status}`)
  const json = await res.json()
  const item = json?.data?.products?.items?.[0]
  if (!item) throw new Error('Fant ikke produktet på Bohus')

  const result = {}
  result.name = item.name
  result.price = Math.round(item.price_range?.minimum_price?.regular_price?.value ?? 0) || undefined
  result.imageUrl = item.image?.url

  const categories = (item.categories || []).map((c) => c.name)
  result.category = mapCategory(categories)

  // Samle alle numeriske og valgte attributter
  const attrs = {}
  for (const attr of item.custom_attributes || []) {
    const code = attr.attribute_metadata?.code
    const entered = attr.entered_attribute_value?.value
    const selected = attr.selected_attribute_options?.attribute_option?.map((o) => o.label)
    const numVal = entered != null && !isNaN(parseFloat(entered)) ? parseFloat(entered) : null
    if (numVal !== null) attrs[code] = numVal
    if (selected?.length) attrs[code + '_sel'] = selected
    if (entered && numVal === null) attrs[code + '_str'] = entered
  }

  result.width  = (attrs['width']  ?? 0) / 100 || undefined
  result.depth  = (attrs['depth']  ?? attrs['length'] ?? 0) / 100 || undefined
  result.height = (attrs['height'] ?? 0) / 100 || undefined
  result.brand  = attrs['brand_sel']?.[0]
  result.colorName = attrs['display_color_str'] || attrs['color_sel']?.[0]

  if (result.colorName) result.colorHex = mapColor(result.colorName)

  const composition = (attrs['composition_sel']?.[0] || '').toLowerCase()
  const sofasDepth2   = attrs['sofas_depth2']    // total dybde inkl. sjeselong (cm)
  const sofasSitdepth = attrs['sofas_sitdepth']  // sittedybde (cm)

  // Detekter rundbord/oval
  if (/rundbord|rund.?bord|ovalt.?bord|oval.?bord/i.test(result.name)) {
    result.shape = 'circle'
    if (result.width && !result.depth) result.depth = result.width
  }

  // Detekter U-form (u-sofa)
  else if (/u-sofa|u\s*form/i.test(composition) || /u-sofa/i.test(result.name)) {
    result.shape = 'u-shape'
    const armWidth = (sofasSitdepth ?? 60) / 100  // armbredde ≈ sittedybde
    result.legW = armWidth
    result.legH = armWidth  // bakstykke ≈ samme dybde
  }

  // Detekter L-form (sjeselong)
  else if (/sjeselong|chaiselong/i.test(composition) || /sjeselong|chaiselong/i.test(result.name)) {
    result.shape = 'l-shape'
    if (sofasDepth2) {
      // Bounding-box dybde = sofas_depth2, sofa-kropp = depth
      result.depth = sofasDepth2 / 100
      result.legH  = (attrs['depth'] ?? 0) / 100   // sofa-kropp-dybde
      result.legW  = (sofasSitdepth ?? 60) * 2 / 100  // estimert sjeselong-bredde
    }
  }

  return result
}

export default async function handler(req, res) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL mangler' })
  }

  try {
    // Bohus-spesifikk håndtering via GraphQL
    if (/bohus\.no/i.test(url)) {
      const result = await fetchBohus(url)
      return res.json(result)
    }

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

        // Kategori fra breadcrumb / category
        const cats = product.category ? [product.category].flat() : []
        if (!result.category && cats.length) result.category = mapCategory(cats)

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

    // 3. Prøv å hente mål fra strukturerte nøkkel/verdi-par i HTML
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

    // 5. Detekter form
    const bodyText = $('body').text()
    const shapeText = (result.name || '') + ' ' + bodyText
    extractLShape(shapeText, result)
    if (!result.shape) extractCircle(shapeText, result)

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

  $('dl').each((_, dl) => {
    const children = $(dl).children().toArray()
    for (let i = 0; i < children.length - 1; i++) {
      const tag = children[i].tagName?.toLowerCase()
      if (tag === 'dt') {
        const key = $(children[i]).text().trim()
        const dd = children[i + 1]
        if (dd?.tagName?.toLowerCase() === 'dd') trySetDim(key, $(dd).text())
      }
    }
  })

  $('tr').each((_, tr) => {
    const cells = $(tr).find('td, th').toArray()
    if (cells.length >= 2) trySetDim($(cells[0]).text().trim(), $(cells[1]).text().trim())
  })

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

  if (!result.width || !result.depth || !result.height) {
    const xPat = /(\d+[\.,]?\d*)\s*[x×X]\s*(\d+[\.,]?\d*)\s*[x×X]\s*(\d+[\.,]?\d*)\s*cm/i
    const m = xPat.exec(clean)
    if (m) {
      result.width  ??= cm(m[1])
      result.depth  ??= cm(m[2])
      result.height ??= cm(m[3])
    }
  }

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

function extractCircle(text, result) {
  const clean = text.replace(/\s+/g, ' ')
  if (!/rundbord|rund.?bord|round.?table|oval.?bord|ovalt.?bord|sirkel|diameter|Ø\s*\d/i.test(clean)) return

  result.shape = 'circle'

  // Hent diameter: "Ø 120 cm", "diameter: 120 cm", "diameter 120cm"
  const cm = (s) => Math.round((parseFloat(s.replace(',', '.')) / 100) * 100) / 100
  const diam = (
    /[Øø]\s*(\d+[\.,]?\d*)\s*cm/i.exec(clean) ||
    /diameter[:\s]*(\d+[\.,]?\d*)\s*cm/i.exec(clean)
  )
  if (diam) {
    const d = cm(diam[1])
    result.width  ??= d
    result.depth  ??= d
  }
}
