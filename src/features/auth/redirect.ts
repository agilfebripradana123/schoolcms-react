/**
 * Single source of truth for role -> login page mapping.
 *
 * Used by every logout handler and by the axios 401 interceptor so an expired
 * session and an explicit logout both land on the login page that matches the
 * account's portal:
 *
 *   siswa                       -> /login        (NIS)
 *   guru                        -> /login/guru   (email)
 *   admin / administrator /     -> /login/admin  (username or email)
 *   super admin
 *
 * ponytail: unknown roles fall back to /login/admin because an admin session
 * is the least-privilege-default for a stale role string; tighten this if the
 * backend starts returning roles that are not user-facing.
 */
export function loginPathForRole(role: string | null | undefined): string {
  switch ((role ?? "").trim().toLowerCase()) {
    case "siswa":
      return "/login";
    case "guru":
      return "/login/guru";
    case "admin":
    case "administrator":
    case "super admin":
      return "/login/admin";
    default:
      return "/login/admin";
  }
}