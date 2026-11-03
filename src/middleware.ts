import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request nonce-based Content Security Policy for HTML pages.
 *
 * Next.js reads the nonce from the request's CSP header and adds it to its own
 * inline scripts; the root layout reads `x-nonce` for the theme bootstrap script.
 * Static security headers (HSTS, nosniff, etc.) live in next.config.mjs.
 *
 * Set CSP_REPORT_ONLY=1 to send the policy as Content-Security-Policy-Report-Only
 * while testing a change.
 */
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    // React Refresh needs eval in development only.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Once UI sets inline style attributes, which can't carry a nonce.
    "style-src 'self' 'unsafe-inline'",
    // Design thumbnails: drive.google.com redirects to lh3.googleusercontent.com.
    "img-src 'self' data: blob: https://drive.google.com https://lh3.googleusercontent.com",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const headerName =
    process.env.CSP_REPORT_ONLY === "1"
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";
  response.headers.set(headerName, csp);
  return response;
}

export const config = {
  matcher: [
    {
      // HTML pages only: skip API routes, static assets, the image optimizer,
      // metadata files and anything with a file extension.
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\\.well-known|.*\\.[a-zA-Z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
