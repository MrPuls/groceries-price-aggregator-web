import { http } from './http'
import { buildQueryString } from '@/utils/request'
import { sanitizeQuery } from '@/utils/sanitize'

export interface ProductDTO {
  name: string
  available_stores: string[]
  product_store_mapping: Record<string, number>
}

export interface ProductPriceDTO {
  price: string // e.g., "99.00 грн"
  currency: string // e.g., "UAH"
}

export interface ProductItem {
  name: string
  availableStores: string[]
  storeIdMap: Record<string, number>
  imageUrl?: string
}

export interface StorePrice {
  store: string
  amount: number
  currency: string
  raw: string
}

export function mapProduct(dto: ProductDTO): ProductItem {
  return {
    name: dto.name,
    availableStores: dto.available_stores ?? [],
    storeIdMap: dto.product_store_mapping ?? {},
  }
}

export async function searchProducts(
  q: string,
  opts: { signal?: AbortSignal } = {},
): Promise<ProductItem[]> {
  const clean = sanitizeQuery(q)
  if (!clean) return []
  const qs = buildQueryString({ q: clean })
  const data = (await http(`/api/v1/products${qs}`, { signal: opts.signal })) as ProductDTO[]
  if (!Array.isArray(data)) return []
  return data.map(mapProduct)
}

export async function getProductPrice(
  productId: number | string,
  opts: { signal?: AbortSignal } = {},
): Promise<StorePrice> {
  const data = (await http(`/api/v1/products/${productId}`, {
    signal: opts.signal,
  })) as ProductPriceDTO
  const amount = parseAmount(data.price)
  return {
    store: '',
    amount,
    currency: data.currency || inferCurrencyFromLabel(data.price) || 'UAH',
    raw: data.price,
  }
}

function parseAmount(label: string): number {
  // Extract number with optional comma/period decimals
  const m = (label || '').replace(/\s+/g, '').match(/([0-9]+(?:[\.,][0-9]{1,2})?)/)
  if (!m) return NaN
  const num = m[1].replace(',', '.')
  const val = Number(num)
  return isFinite(val) ? val : NaN
}

function inferCurrencyFromLabel(label: string): string | null {
  const l = (label || '').toLowerCase()
  if (l.includes('грн') || l.includes('uah')) return 'UAH'
  if (l.includes('€') || l.includes('eur')) return 'EUR'
  if (l.includes('$') || l.includes('usd')) return 'USD'
  return null
}
