/** Only same-site paths are allowed, so a crafted login link can't redirect off-site. */
export function safeCallbackUrl(value: unknown, fallback = "/profile") {
  if (typeof value !== "string") return fallback;
  return /^\/(?![/\\])/.test(value) ? value : fallback;
}
