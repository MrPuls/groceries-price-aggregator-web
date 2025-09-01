/**
 * URL encoding helpers for backend requests.
 * Use these to safely build query strings. Ensure values are sanitized first.
 */
export function encodeQueryParam(value: string | number | boolean): string {
  return encodeURIComponent(String(value))
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined | Array<string | number | boolean>
>

export function buildQueryString(params: QueryParams): string {
  const parts: string[] = []
  for (const key of Object.keys(params)) {
    const val = params[key]
    if (val === undefined || val === null) continue
    const k = encodeQueryParam(key)
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v === undefined || v === null || v === '') continue
        parts.push(`${k}=${encodeQueryParam(v)}`)
      }
    } else {
      if (val === '') continue
      parts.push(`${k}=${encodeQueryParam(val)}`)
    }
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

/** Example helper to build a search URL for the backend. */
export function buildSearchUrl(baseUrl: string, opts: { q: string; page?: number; sort?: string }) {
  const qs = buildQueryString({ q: opts.q, page: opts.page, sort: opts.sort })
  return `${baseUrl.replace(/\/$/, '')}/search${qs}`
}
