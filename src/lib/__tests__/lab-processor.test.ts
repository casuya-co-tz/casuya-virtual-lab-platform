import { describe, it, expect } from 'vitest'
import { sanitizeLabCode, computeSecurityScore } from '../lab-processor'

describe('sanitizeLabCode', () => {
  it('removes script tags', () => {
    const result = sanitizeLabCode('<script>alert("xss")</script><p>safe</p>')
    expect(result).toBe('<p>safe</p>')
  })

  it('removes inline event handlers', () => {
    const result = sanitizeLabCode('<button onclick="alert(1)">Click</button>')
    expect(result).toBe('<button>Click</button>')
  })

  it('removes event handlers with single quotes', () => {
    const result = sanitizeLabCode("<div onload='evil()'>content</div>")
    expect(result).toBe('<div>content</div>')
  })

  it('returns clean code unchanged', () => {
    const clean = '<div class="lab"><h1>OK</h1></div>'
    expect(sanitizeLabCode(clean)).toBe(clean)
  })
})

describe('computeSecurityScore', () => {
  it('returns 100 for clean code', () => {
    expect(computeSecurityScore('<div>safe</div>')).toBe(100)
  })

  it('deducts for script tags', () => {
    const score = computeSecurityScore('<script>bad</script>')
    expect(score).toBeLessThan(100)
  })

  it('never returns below 0', () => {
    const score = computeSecurityScore('<script>a</script><script>b</script><script>c</script><script>d</script>')
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('deducts for eval usage', () => {
    const score = computeSecurityScore('eval(something)')
    expect(score).toBe(80)
  })

  it('deducts for document.write', () => {
    const score = computeSecurityScore('document.write("test")')
    expect(score).toBe(85)
  })
})
