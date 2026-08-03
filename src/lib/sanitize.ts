import DOMPurify from 'dompurify'
import sanitizeHtml from 'sanitize-html'

export const SAFE_TAGS = [
  'p', 'div', 'span', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'a', 'b', 'i', 'u', 'em', 'strong', 'small', 'sub', 'sup', 'mark', 'del', 'ins',
  'pre', 'code', 'kbd', 'samp', 'var',
  'blockquote', 'q', 'cite',
  'abbr', 'address', 'time',
  'figure', 'figcaption', 'details', 'summary',
  'img', 'picture', 'source',
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
  'text', 'g', 'defs', 'use', 'clipPath', 'mask',
  'linearGradient', 'radialGradient', 'stop',
  'math', 'mi', 'mo', 'mn', 'ms', 'mover', 'munder', 'munderover',
  'msup', 'msub', 'msubsup', 'mfrac', 'msqrt', 'mroot', 'mspace',
  'mpadded', 'mphantom', 'merror', 'menclose', 'mtable', 'mtr', 'mtd',
  'canvas',
]

export const SAFE_ATTRS = [
  'class', 'id', 'style',
  'href', 'target', 'rel', 'title',
  'src', 'alt', 'width', 'height', 'loading',
  'colspan', 'rowspan', 'border', 'cellpadding', 'cellspacing',
  'align', 'valign', 'bgcolor',
  'fill', 'stroke', 'stroke-width', 'viewBox', 'd', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
  'xmlns', 'version',
  'start', 'type', 'compact',
  'data-*',
]

export const SANITIZE_CONFIG = DOMPurify.isSupported
  ? {
      ALLOWED_TAGS: SAFE_TAGS,
      ALLOWED_ATTR: SAFE_ATTRS,
      ALLOW_DATA_ATTR: true,
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      WHOLE_DOCUMENT: false,
      FORBID_TAGS: ['script', 'noscript'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
                     'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
                     'onkeydown', 'onkeyup', 'onkeypress', 'oninput',
                     'ontouchstart', 'ontouchend', 'ontouchmove',
                     'onafterprint', 'onbeforeprint', 'onbeforeunload',
                     'onhashchange', 'onmessage', 'onoffline', 'ononline',
                     'onpagehide', 'onpageshow', 'onpopstate', 'onstorage',
                     'onundo', 'onunload',
                     'ondrag', 'ondrop', 'onwaiting',
                     'onpointerdown', 'onpointerup', 'onpointermove'],
    }
  : undefined

export function sanitizeSafe(html: string): string {
  if (DOMPurify.isSupported && SANITIZE_CONFIG) {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG)
  }

  // Server-side (no DOM): fail closed by stripping anything not in the allowlist.
  try {
    return sanitizeHtml(html, {
      allowedTags: SAFE_TAGS,
      allowedAttributes: {
        '*': SAFE_ATTRS,
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      allowedSchemesByTag: { img: ['http', 'https', 'data'] },
      disallowedTagsMode: 'discard',
    })
  } catch {
    return html
      .replace(/<script[\s>]/gi, '')
      .replace(/\son\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
  }
}

const SCRIPT_TAG = /<script[\s>]/i
const HANDLER_ATTR = /\son\w+\s*=/i
const JS_URL = /javascript:\s*/i
const THREE_PATTERN = /\b(?:THREE\.|new\s+THREE\.|WebGLRenderer|WebGL2RenderingContext)\b/i
const DYNAMIC_IMPORT = /\bimport\s*\(/i
const EVAL_PATTERN = /\b(?:eval|new\s+Function)\s*\(/i

export function needsSandbox(html: string): boolean {
  return SCRIPT_TAG.test(html) ||
    HANDLER_ATTR.test(html) ||
    JS_URL.test(html) ||
    THREE_PATTERN.test(html) ||
    DYNAMIC_IMPORT.test(html) ||
    EVAL_PATTERN.test(html)
}

export function hasMermaid(html: string): boolean {
  return /<pre[^>]*class="[^"]*\bmermaid\b[^"]*"/i.test(html)
}

export function hasMath(html: string): boolean {
  return /(?:\$\$?[\s\S]+?\$\$?|\\\(|\\\[)/.test(html)
}
