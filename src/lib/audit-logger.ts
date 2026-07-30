import { query } from '@/lib/db'

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'signup'
  | 'brute_force'
  | 'rls_denied'
  | 'api_key_create'
  | 'api_key_revoke'
  | 'create'
  | 'update'
  | 'delete'

export type AuditEntityType =
  | 'user'
  | 'lab'
  | 'subscription'
  | 'api_key'
  | 'setting'
  | 'payment'
  | 'review'
  | 'blog_post'

export async function logAuditEvent(params: {
  userId: string | null
  action: AuditAction
  entityType?: AuditEntityType
  entityId?: string
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  ipAddress?: string | null
}) {
  try {
    await query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, old_value, new_value, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, NOW())`,
      [
        params.userId,
        params.action,
        params.entityType || null,
        params.entityId || null,
        params.oldValues ? JSON.stringify(params.oldValues) : null,
        params.newValues ? JSON.stringify(params.newValues) : null,
        params.ipAddress || null,
      ]
    )
  } catch {
    // Silently fail — audit logging should never block the main flow
  }
}
