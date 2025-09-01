export function sanitizeQuery(input: string | null | undefined, maxLen = 200): string {
  if (!input) return ''
  let s = String(input)
  // Normalize unicode to reduce homoglyph tricks
  try {
    s = s.normalize('NFKC')
  } catch {}
  // Remove SQL comments and control chars
  s = s
    .replace(/\u0000|[\u0001-\u001F\u007F]/g, ' ') // control chars -> space
    .replace(/--[^\n\r]*/g, ' ') // line comments -- ...
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // block comments /* ... */
  // Remove dangerous metacharacters commonly used in injections
  s = s.replace(/[;"'`\\]/g, ' ')
  // Remove classic boolean short-circuit payloads like OR 1=1 / and 1=1
  s = s.replace(/\b(or|and)\s+([\(\s]*)1\s*=\s*1([\)\s]*)/gi, ' ')
  // Remove risky SQL keywords when they appear as standalone tokens
  s = s.replace(/\b(select|union|insert|update|delete|drop|alter|create|exec|execute)\b/gi, ' ')
  // Collapse whitespace and trim
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length > maxLen) {
    s = s.slice(0, maxLen).trim()
  }
  return s
}
