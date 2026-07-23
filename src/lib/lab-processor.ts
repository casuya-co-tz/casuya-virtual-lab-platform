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
