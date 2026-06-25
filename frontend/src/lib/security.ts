import { supabase } from "@/integrations/supabase/client";

export const MAX_FAILED = 5;
export const LOCK_MINUTES = 15;
export const PASSWORD_MAX_AGE_DAYS = 90;
export const PASSWORD_WARN_DAYS = 15;

export async function getLoginAttempt(username: string) {
  const { data } = await supabase
    .from("login_attempts" as any)
    .select("*")
    .eq("username", username)
    .maybeSingle();
  return data as any;
}

export async function recordFailedAttempt(username: string) {
  const existing = await getLoginAttempt(username);
  const now = new Date();
  const newCount = (existing?.failed_count ?? 0) + 1;
  const locked_until =
    newCount >= MAX_FAILED ? new Date(now.getTime() + LOCK_MINUTES * 60_000).toISOString() : null;

  if (existing) {
    await supabase.from("login_attempts" as any).update({
      failed_count: newCount,
      locked_until,
      last_attempt_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).eq("username", username);
  } else {
    await supabase.from("login_attempts" as any).insert({
      username, failed_count: newCount, locked_until,
      last_attempt_at: now.toISOString(),
    });
  }
  return { failed_count: newCount, locked_until, remaining: Math.max(0, MAX_FAILED - newCount) };
}

export async function resetAttempts(username: string) {
  await supabase.from("login_attempts" as any).update({
    failed_count: 0, locked_until: null, updated_at: new Date().toISOString(),
  }).eq("username", username);
}

export function isLocked(attempt: any): { locked: boolean; remainingMs: number } {
  if (!attempt?.locked_until) return { locked: false, remainingMs: 0 };
  const ms = new Date(attempt.locked_until).getTime() - Date.now();
  return { locked: ms > 0, remainingMs: Math.max(0, ms) };
}

export function passwordAgeStatus(passwordLastChanged: string, role: string) {
  if (role === "ADMIN") return { expired: false, daysLeft: Infinity, warn: false };
  const last = new Date(passwordLastChanged).getTime();
  const ageDays = (Date.now() - last) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.ceil(PASSWORD_MAX_AGE_DAYS - ageDays);
  return {
    expired: daysLeft <= 0,
    daysLeft,
    warn: daysLeft > 0 && daysLeft <= PASSWORD_WARN_DAYS,
  };
}
