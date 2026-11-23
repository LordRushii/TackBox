import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Clerk's Frontend API host is encoded in the publishable key: pk_test_<base64("host$")> */
function clerkHost(): string | null {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const encoded = key?.split("_")[2];
  if (!encoded) return null;
  const host = Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
  return /^[a-z0-9.-]+$/i.test(host) ? host : null;
}

const clerk = clerkHost();
const clerkOrigin = clerk ? `https://${clerk}` : "https://*.clerk.accounts.dev";

// Scripts only from this site, Clerk, Cloudflare's bot check and Google One Tap.
// 'unsafe-inline' stays because Next.js injects inline bootstrap scripts without nonces.
const csp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev && "'unsafe-eval'",
    clerkOrigin,
    "https://challenges.cloudflare.com",
    "https://accounts.google.com/gsi/client",
  ],
  [
    "connect-src 'self'",
    clerkOrigin,
    "https://clerk-telemetry.com https://*.clerk-telemetry.com",
    "https://accounts.google.com/gsi/",
    isDev && "ws: wss:",
  ],
  // Avatars can be any https image or an uploaded data URL
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  "font-src 'self' data:",
  ["frame-src", clerkOrigin, "https://challenges.cloudflare.com https://accounts.google.com/gsi/"],
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  !isDev && "upgrade-insecure-requests",
]
  .map((d) => (Array.isArray(d) ? d.filter(Boolean).join(" ") : d))
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Nobody can frame the site (clickjacking on login and delete buttons)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
