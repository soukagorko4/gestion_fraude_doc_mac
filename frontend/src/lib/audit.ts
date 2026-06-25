import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGOUT" | "ACCOUNT_LOCKED" | "ACCOUNT_DISABLED"
  | "PASSWORD_CHANGED" | "PASSWORD_FORCED_CHANGE"
  | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ACTIVATED" | "USER_DEACTIVATED"
  | "FRAUDE_CREATED" | "FRAUDE_UPDATED" | "FRAUDE_DELETED"
  | "ROLE_CREATED" | "ROLE_UPDATED" | "ROLE_DELETED"
  | "SERVICE_CREATED" | "SERVICE_UPDATED" | "SERVICE_DELETED"
  | "SERVICE_PARENT_CREATED" | "SERVICE_PARENT_UPDATED" | "SERVICE_PARENT_DELETED"
  | "PAGE_VIEW" | "DETAIL_VIEW";

export async function logAudit(
  action: AuditAction,
  opts: { entity?: string; entity_id?: string | number; details?: any; username?: string } = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      username: opts.username ?? user?.email ?? null,
      action,
      entity: opts.entity ?? null,
      entity_id: opts.entity_id ? String(opts.entity_id) : null,
      details: opts.details ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (e) {
    console.error("audit log error", e);
  }
}
