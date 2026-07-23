import { describe, it, expect } from 'vitest'
import { sanitizeLabCode } from '../lab-processor'

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
