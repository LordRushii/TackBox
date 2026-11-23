/**
 * Returns `target` only if it is a path on this site. Blocks absolute URLs,
 * protocol-relative "//evil.com", backslash tricks and javascript: links,
 * so a crafted ?redirect= can't send a freshly signed-in user elsewhere.
 */
export function safeRedirect(target: string | null | undefined, fallback = "/my-skills"): string {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(target, "http://local.invalid");
    if (url.origin !== "http://local.invalid") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
