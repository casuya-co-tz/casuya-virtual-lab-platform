import { describe, expect, it } from 'vitest'
import {
  BAIT_PATHS,
  isBaitPath,
  isScannerUserAgent,
  buildDecoyBody,
  buildDeceptionAlert,
  signDeceptionAlert,
} from '../deception'

describe('deception', () => {
  it('detects bait paths', () => {
    expect(isBaitPath('/.env')).toBe(true)
    expect(isBaitPath('/.env.production')).toBe(true)
    expect(isBaitPath('/.git/config')).toBe(true)
    expect(isBaitPath('/wp-admin/install.php')).toBe(true)
    expect(isBaitPath('/phpmyadmin')).toBe(true)
    expect(isBaitPath('/server-status')).toBe(true)
  })

  it('never flags real application paths', () => {
    for (const p of [
      '/',
      '/labs',
      '/labs/abc-123',
      '/api/auth/login',
      '/api/v1/labs',
      '/support',
      '/blog/hello-world',
      '/pricing',
    ]) {
      expect(isBaitPath(p)).toBe(false)
    }
  })

  it('detects common scanner user agents', () => {
    expect(isScannerUserAgent('Mozilla/5.0 (compatible; Nmap Scripting Engine)')).toBe(true)
    expect(isScannerUserAgent('sqlmap/1.7')).toBe(true)
    expect(isScannerUserAgent('Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)')).toBe(true)
  })

  it('does not flag normal browsers', () => {
    expect(isScannerUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36')).toBe(false)
    expect(isScannerUserAgent(null)).toBe(false)
    expect(isScannerUserAgent(undefined)).toBe(false)
  })

  it('serves an inert env decoy for .env probes', () => {
    const { body, contentType } = buildDecoyBody('/.env')
    expect(contentType).toContain('text/plain')
    expect(body).not.toContain('LAB_CONTENT_API_KEY')
    expect(body).not.toContain('SECRET')
  })

  it('serves an inert html decoy otherwise', () => {
    const { body, contentType } = buildDecoyBody('/wp-admin')
    expect(contentType).toContain('text/html')
    expect(body).toContain('<h1>')
  })

  it('builds a structured alert payload', () => {
    const alert = buildDeceptionAlert({
      type: 'bait_hit',
      ip: '203.0.113.9',
      path: '/.env',
      userAgent: 'sqlmap/1.7',
    })
    const parsed = JSON.parse(alert)
    expect(parsed.event).toBe('casuya.deception')
    expect(parsed.type).toBe('bait_hit')
    expect(parsed.ip).toBe('203.0.113.9')
    expect(parsed.path).toBe('/.env')
  })

  it('signs alerts with HMAC-SHA256', async () => {
    const sig = await signDeceptionAlert('{"event":"casuya.deception"}', 'test-secret')
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
  })

  it('bait path list covers the documented honeypots', () => {
    for (const p of ['/.env', '/.git/config', '/wp-login.php', '/phpmyadmin', '/backup.zip', '/.aws/credentials']) {
      expect(BAIT_PATHS).toContain(p)
    }
  })
})
