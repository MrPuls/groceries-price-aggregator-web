import { describe, it, expect } from 'vitest'
import { sanitizeQuery } from '@/utils/sanitize'

describe('sanitizeQuery', () => {
  it('preserves Ukrainian text and trims whitespace', () => {
    expect(sanitizeQuery('  сир  кисломолочний  ')).toBe('сир кисломолочний')
  })

  it('removes SQL comments and dangerous metacharacters', () => {
    const input = "молоко -- drop table users; /* comment */ 'молоко' ; \""
    const out = sanitizeQuery(input)
    expect(out.includes('--')).toBe(false)
    expect(out.includes('/*')).toBe(false)
    expect(out.includes("'")).toBe(false)
    expect(out.includes('"')).toBe(false)
    expect(out.includes(';')).toBe(false)
  })

  it('neutralizes OR 1=1 pattern', () => {
    const input = 'сир OR 1=1'
    const out = sanitizeQuery(input)
    expect(/1\s*=\s*1/i.test(out)).toBe(false)
  })

  it('removes risky SQL keywords when standalone', () => {
    const input = 'select сир union all молоко'
    const out = sanitizeQuery(input)
    expect(/\bselect\b/i.test(out)).toBe(false)
    expect(/\bunion\b/i.test(out)).toBe(false)
  })

  it('caps length', () => {
    const input = 'а'.repeat(500)
    const out = sanitizeQuery(input)
    expect(out.length).toBeLessThanOrEqual(200)
  })
})
