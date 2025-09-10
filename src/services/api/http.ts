export interface HttpError extends Error {
  status: number
  code?: string
  data?: any
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeoutMs?: number
  signal?: AbortSignal
}

function baseUrl(): string {
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080'
}

export async function http(path: string, opts: RequestOptions = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000)

  let combinedSignal: AbortSignal
  if (opts.signal) {
    const combined = new AbortController()
    const onAbort = () => combined.abort()
    opts.signal.addEventListener('abort', onAbort)
    controller.signal.addEventListener('abort', onAbort)
    combinedSignal = combined.signal
  } else {
    combinedSignal = controller.signal
  }

  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: combinedSignal,
    })

    const ct = res.headers.get('content-type') || ''
    const isJson = ct.includes('application/json') || ct.includes('+json')
    const data = isJson ? await res.json().catch(() => null) : await res.text()

    if (!res.ok) {
      const err: HttpError = Object.assign(new Error('HTTP error'), {
        name: 'HttpError',
        status: res.status,
        code: (data && (data.code || data.error)) || undefined,
        data,
      })
      throw err
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}
