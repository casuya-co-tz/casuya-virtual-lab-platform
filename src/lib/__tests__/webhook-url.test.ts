import { describe, expect, it } from 'vitest'
import { isAllowedWebhookUrl } from '../webhook-url'

describe('webhook-url', () => {
  it('allows public https endpoints', () => {
    expect(isAllowedWebhookUrl('https://example.com/webhook')).toBe(true)
  })

  it('blocks localhost and private addresses', () => {
    expect(isAllowedWebhookUrl('http://localhost/hook')).toBe(false)
    expect(isAllowedWebhookUrl('http://127.0.0.1/hook')).toBe(false)
    expect(isAllowedWebhookUrl('http://192.168.1.1/hook')).toBe(false)
    expect(isAllowedWebhookUrl('http://169.254.169.254/')).toBe(false)
  })
})
