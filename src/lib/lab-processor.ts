import sanitizeHtml from 'sanitize-html'

export function sanitizeLabCode(code: string): string {
  return sanitizeHtml(code, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['canvas', 'style', 'img', 'section', 'button', 'input', 'label', 'select', 'option', 'textarea']),
    allowedAttributes: {
      '*': ['class', 'id', 'style'],
      a: ['href', 'target'],
      img: ['src', 'width', 'height'],
      canvas: ['width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'data'],
    disallowedTagsMode: 'discard',
    enforceHtmlBoundary: true,
    allowVulnerableTags: true,
  })
}

export function computeSecurityScore(code: string): number {
  let score = 100
  if (/<script/i.test(code)) score -= 30
  if (/on\w+\s*=/i.test(code)) score -= 20
  if (/eval\s*\(/i.test(code)) score -= 20
  if (/document\.write/i.test(code)) score -= 15
  if (/innerHTML\s*=/i.test(code)) score -= 10
  if (score < 0) score = 0
  return score
}
