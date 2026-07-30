import crypto from 'crypto'

const AZAMPAY_AUTH_URL = 'https://authenticator.azampay.co.tz'
const AZAMPAY_CHECKOUT_URL = 'https://checkout.azampay.co.tz'
const AZAMPAY_DISBURSE_URL = 'https://api-disbursement.azampay.co.tz'
const AUTH_PATH = '/AppRegistration/GenerateToken'
const MNO_CHECKOUT_PATH = '/azampay/mno/checkout'
const TX_STATUS_PATH = '/api/v1/azampay/transactionstatus'

const TOKEN_TTL_MS = 23 * 60 * 60 * 1000

let cachedToken: { token: string; expiresAt: number } | null = null

function getConfig() {
  const appName = process.env.AZAMPESA_APP_NAME
  const clientId = process.env.AZAMPESA_CLIENT_ID
  const clientSecret = process.env.AZAMPESA_CLIENT_SECRET
  const apiKey = process.env.AZAMPESA_API_KEY
  if (!appName || !clientId || !clientSecret) {
    throw new Error('AzamPay credentials not configured: AZAMPESA_APP_NAME, AZAMPESA_CLIENT_ID, AZAMPESA_CLIENT_SECRET')
  }
  return { appName, clientId, clientSecret, apiKey: apiKey || '' }
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const { appName, clientId, clientSecret } = getConfig()
  const res = await fetch(`${AZAMPAY_AUTH_URL}${AUTH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appName, clientId, clientSecret }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`AzamPay auth failed (${res.status}): ${body}`)
  }

  const data = await res.json()
  if (!data.success || !data.data?.accessToken) {
    throw new Error(`AzamPay auth error: ${data.message || JSON.stringify(data)}`)
  }

  const token = `Bearer ${data.data.accessToken}`
  cachedToken = { token, expiresAt: Date.now() + TOKEN_TTL_MS }
  return token
}

export function createChecksum(apiKey: string, payload: Record<string, unknown>): string {
  const canonical = canonicalize(payload)
  const body = JSON.stringify(canonical)
  return crypto.createHmac('sha256', apiKey).update(body).digest('hex')
}

function canonicalize(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(canonicalize)
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = canonicalize((obj as Record<string, unknown>)[key])
  }
  return sorted
}

function buildHeaders(token: string, apiKey: string) {
  const headers: Record<string, string> = { Authorization: token }
  if (apiKey) headers['X-API-Key'] = apiKey
  return headers
}

export type MobileProvider = 'Airtel' | 'Tigo' | 'Halopesa' | 'Azampesa' | 'Mpesa'

export const PROVIDER_MAP: Record<string, MobileProvider> = {
  mpesa: 'Mpesa',
  vodacom: 'Mpesa',
  'vodacom mpesa': 'Mpesa',
  airtel: 'Airtel',
  'airtel money': 'Airtel',
  tigo: 'Tigo',
  'mixx by yas': 'Tigo',
  'mixx': 'Tigo',
  'mix by yas': 'Tigo',
  halopesa: 'Halopesa',
  halotel: 'Halopesa',
  azampesa: 'Azampesa',
  azam: 'Azampesa',
}

export const PROVIDER_DISPLAY: { id: MobileProvider; label: string; labelSw: string; prefixes: string[] }[] = [
  { id: 'Mpesa', label: 'Vodacom M-Pesa', labelSw: 'Vodacom M-Pesa', prefixes: ['071', '072', '073', '074', '075', '076'] },
  { id: 'Airtel', label: 'Airtel Money', labelSw: 'Airtel Money', prefixes: ['068', '078', '069', '079'] },
  { id: 'Tigo', label: 'Mixx by Yas', labelSw: 'Mixx by Yas', prefixes: ['065', '067', '070', '071'] },
  { id: 'Halopesa', label: 'Halopesa', labelSw: 'Halopesa', prefixes: ['062', '072'] },
  { id: 'Azampesa', label: 'Azampesa', labelSw: 'Azampesa', prefixes: ['073', '074'] },
]

export function detectProvider(phone: string): MobileProvider | null {
  const cleaned = phone.replace(/\D/g, '')
  const local = cleaned.startsWith('255') ? cleaned.slice(3) : cleaned.startsWith('0') ? cleaned.slice(1) : cleaned
  const prefix = local.slice(0, 3)
  if (['068', '069', '078', '079'].includes(prefix)) return 'Airtel'
  if (['065', '067', '070'].includes(prefix)) return 'Tigo'
  if (prefix === '062') return 'Halopesa'
  if (['071', '072', '073', '074', '075'].includes(prefix)) return 'Mpesa'
  return null
}

export function formatAccountNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('255')) return cleaned
  if (cleaned.startsWith('0')) return '255' + cleaned.slice(1)
  return '255' + cleaned
}

export interface MobileCheckoutParams {
  amount: string
  accountNumber: string
  externalId: string
  provider: MobileProvider
  currency?: string
  callbackUrl?: string
}

export interface MobileCheckoutResult {
  success: boolean
  transactionId?: string
  message?: string
  response?: Record<string, unknown>
}

export async function mobileCheckout(params: MobileCheckoutParams): Promise<MobileCheckoutResult> {
  const { apiKey } = getConfig()
  const token = await getAccessToken()

  const payload: Record<string, unknown> = {
    accountNumber: params.accountNumber,
    amount: params.amount,
    currency: params.currency || 'TZS',
    externalId: params.externalId,
    provider: params.provider,
  }
  if (params.callbackUrl) {
    payload.callbackUrl = params.callbackUrl
  }
  if (apiKey) {
    payload.checksum = createChecksum(apiKey, payload)
  }

  const res = await fetch(`${AZAMPAY_CHECKOUT_URL}${MNO_CHECKOUT_PATH}`, {
    method: 'POST',
    headers: { ...buildHeaders(token, apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await res.json()

  if (!res.ok || body.success === false) {
    return {
      success: false,
      message: body.message || `AzamPay checkout failed (${res.status})`,
      response: body,
    }
  }

  return {
    success: true,
    transactionId: body.data?.transactionId || body.data?.pgReferenceId || body.transactionId,
    message: body.message || 'Payment initiated',
    response: body,
  }
}

export interface TransactionStatusResult {
  success: boolean
  status?: string
  resultCode?: number
  resultDesc?: string
  transactionId?: string
  amount?: string
  message?: string
  response?: Record<string, unknown>
}

export async function getTransactionStatus(params: {
  pgReferenceId?: string
  externalId?: string
}): Promise<TransactionStatusResult> {
  const { apiKey } = getConfig()
  const token = await getAccessToken()

  const urlParams = new URLSearchParams()
  if (params.pgReferenceId) urlParams.set('pgReferenceId', params.pgReferenceId)
  if (params.externalId) urlParams.set('externalId', params.externalId)

  const res = await fetch(
    `${AZAMPAY_DISBURSE_URL}${TX_STATUS_PATH}?${urlParams.toString()}`,
    {
      headers: buildHeaders(token, apiKey),
    }
  )

  const body = await res.json()

  if (!res.ok) {
    return {
      success: false,
      message: body.message || `Status check failed (${res.status})`,
      response: body,
    }
  }

  return {
    success: true,
    status: body.data?.status || body.status,
    resultCode: body.data?.resultCode || body.resultCode,
    resultDesc: body.data?.resultDesc || body.resultDesc,
    transactionId: body.data?.transactionId || body.transactionId,
    amount: body.data?.amount || body.amount,
    response: body,
  }
}

export function verifyWebhookChecksum(apiKey: string, payload: Record<string, unknown>, signature: string): boolean {
  const expected = createChecksum(apiKey, payload)
  if (typeof signature !== 'string' || expected.length !== signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
