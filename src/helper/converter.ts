/** Formats a timestamp in German notation; a missing value formats the current time, as Intl does. */
export function convertTimestamp(ts: number | Date | null | undefined, short = false): string {
  let options: Intl.DateTimeFormatOptions
  if (short)
  {
    options = { year: 'numeric', month: 'numeric', day: 'numeric'};
  }
  else{
    options = { year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric' };
  }

    return Intl.DateTimeFormat('de-DE',options).format(ts as number | Date | undefined)
  }

export function formatNumber(number: number): string {
  return Intl.NumberFormat('en',
  {
      notation:'compact'
  }).format(number);
}

export const ROLES = ["Besucher", "Frischling", "Mitglied", "Vorstand", "Admin"] as const;
export type Role = (typeof ROLES)[number];
const roles: readonly string[] = ROLES;

export function hasRequiredRole(userRole: string | null | undefined, requiredRole?: string | null): boolean {
  if (!userRole) return false;
  if (!requiredRole) return true;
  const userIndex = roles.indexOf(userRole);
  const requiredIndex = roles.indexOf(requiredRole);
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}

/** Vorstand and Admin may edit and delete content of other users (same rule as the backend). */
export function isModerator(userRole: string | null | undefined): boolean {
  return hasRequiredRole(userRole, "Vorstand");
}
