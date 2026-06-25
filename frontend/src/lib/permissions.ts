export function canModifyCase(
  createdAt: string | null | undefined,
  caseUserId: string,
  currentUserId: string | undefined,
  role: string | undefined
): boolean {
  if (!createdAt || !currentUserId) return false;
  const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  const isAdmin = role === "ADMIN";
  const isOwner = caseUserId === currentUserId;
  if (isAdmin) return ageMinutes <= 60;
  if (isOwner) return ageMinutes <= 30;
  return false;
}

export function timeRemainingLabel(
  createdAt: string | null | undefined,
  role: string | undefined
): string {
  if (!createdAt) return "";
  const limit = role === "ADMIN" ? 60 : 30;
  const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  const remaining = Math.max(0, Math.floor(limit - ageMinutes));
  return remaining > 0 ? `${remaining} min restantes` : "Expiré";
}
