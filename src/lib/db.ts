import { Pool, QueryResult } from 'pg'

function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

const pool = new Pool({
  host: getEnv('PGHOST'),
  port: parseInt(getEnv('PGPORT')),
  user: getEnv('PGUSER'),
  password: getEnv('PGPASSWORD'),
  database: getEnv('PGDATABASE'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export async function transaction<T>(
  fn: (query: (text: string, params?: unknown[]) => Promise<QueryResult>) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(async (text: string, params?: unknown[]) => client.query(text, params))
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
