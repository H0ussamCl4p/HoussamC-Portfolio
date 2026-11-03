# Security Audit: houssamc-portfolio.vercel.app

| | |
|---|---|
| **Target** | Personal portfolio, Next.js App Router on Vercel (`https://houssamc-portfolio.vercel.app`) and its source repository |
| **Date** | 3 November 2026 |
| **Auditor** | Houssam Choubik, with AI-assisted review (Claude Code) |
| **Type** | White-box review of source and git history, plus non-destructive black-box checks against production |

## 1. Scope and methodology

**In scope:** all code in this repository (routes, API route handlers, components, config), the full git history, npm dependencies, HTTP response headers of the production deployment, and third-party origins the site depends on.

**Out of scope:** Vercel account and Google Cloud account settings (reviewed only from the outside, recommendations in section 6), denial-of-service testing, and anything beyond read-only requests against production. No form was submitted and no email was sent during testing.

**Method**

1. Recon: enumerated every route and route handler from `src/app/**`, and requested each one in production to record status codes.
2. Secrets: manual grep of the working tree and of `git log --all -p` for key formats (Google, GitHub, OpenAI, Slack, PEM, base64-encoded JSON), plus `trivy fs --scanners secret`.
3. Dependencies: `npm audit`, and the installed `next` / `react` versions checked against GitHub Security Advisories, with explicit checks for CVE-2025-29927 and CVE-2025-55182.
4. Code review of each route handler for input validation, SSRF, injection, auth and error handling; review of every `dangerouslySetInnerHTML`, MDX renderer and place external data is rendered.
5. Header review with `curl -D -` against production, before and after hardening (after-hardening results are from a local production build; see section 5).
6. Domain check: DNS (`dns.google`) and registry RDAP lookup for every domain referenced in config.

**Tools:** curl, git, npm audit, Trivy 0.69.3 (secret scanner), Python/Pillow (image metadata), Chromium DevTools via the Claude desktop browser pane (CSP violations, network), Lighthouse.

## 2. Attack surface (before changes)

| Route | Method | Accepts | Returns | Notes |
|---|---|---|---|---|
| `/` | GET | | HTML | One-page portfolio, ISR (`revalidate = 3600`) |
| `/about` | GET | | 307 to `/#about` | |
| `/designs` | GET | | HTML shell, images loaded client-side | Renders only "Loading designs..." without JS |
| `/gallery` | GET | | Duplicate of `/designs` | Not in route config; served 200 by the server, hidden only by a client-side guard |
| `/api/og/generate` | GET | `title` (any length) | PNG | Fetched Google Fonts CSS and the avatar from `baseURL` on every call; returned **500 in production** |
| `/api/drive-designs` | GET | (ignored `ts` cache-buster) | JSON list of Drive files | Uses the Google service account; about 13 Drive API calls per uncached request |
| `/api/mdx-parse` | GET, POST | JSON `{category, slug}` | Raw file content from Drive | Not used by any page |
| `/api/contact` | POST | JSON `{name, email, subject, message}` | Sends email via SMTP | Not used by any page |
| `/api/authenticate` | POST | JSON `{password}` | Sets `authToken` cookie | Password-protection feature, no route uses it |
| `/api/check-auth` | GET | `authToken` cookie | 200 / 401 | Same feature |
| `/api/github-public` | GET | | 410 | Dead endpoint |
| `/robots.txt`, `/sitemap.xml` | GET | | Text / XML | Both pointed at the dangling domain (F-02) |

No `middleware.ts` and no server actions existed.

**External origins:** `fonts.googleapis.com` / `fonts.gstatic.com` (build-time via `next/font`, and at runtime by the OG route), `drive.google.com` and `*.googleusercontent.com` (design thumbnails), `www.googleapis.com` (Drive API, server-side), `www.linkedin.com` (outbound links only). No analytics, no third-party scripts, no cookies set on normal page views.

## 3. Findings

Severity uses CVSS-style reasoning (attack vector, privileges, user interaction, impact) adjusted to the real context of a static personal site. Statuses are updated in place as fixes land.

| ID | Title | Severity | Affected | Status |
|---|---|---|---|---|
| F-01 | Google Cloud service account private key committed to a public repository | **High** | `google-sa-base64.txt`, git history since the first commit | Open |
| F-02 | Dangling, unregistered domain used as the site's base URL | **Medium** | `src/resources/once-ui.config.ts` | Open |
| F-03 | Outdated Next.js with known critical and high advisories | **High** | `package.json` (`next@15.3.8`) | Open |
| F-04 | Unused `/api/mdx-parse` endpoint with Drive query injection | **Medium** | `src/app/api/mdx-parse/route.ts` | Open |
| F-05 | Missing security headers (CSP, framing, MIME sniffing, referrer, permissions) | **Medium** | All routes | Open |
| F-06 | Unused password-protection feature with a forgeable cookie | **Low** | `src/app/api/authenticate`, `check-auth`, `RouteGuard.tsx` | Open |
| F-07 | Unused `/api/contact` endpoint without rate limiting, leaking internal errors | **Low** | `src/app/api/contact/route.ts` | Open |
| F-08 | OG image route: unbounded input, runtime third-party fetches, no caching, broken in production | **Low** | `src/app/api/og/generate/route.tsx` | Open |
| F-09 | Drive listing endpoint: error detail leakage and cache-busting that multiplies API calls | **Low** | `src/app/api/drive-designs/route.ts`, `DesignsView.tsx` | Open |
| F-10 | Image optimizer allowed to proxy any path on two Google hosts | **Low** | `next.config.mjs` `images.remotePatterns` | Open |
| F-11 | Vulnerable and unused npm dependencies | **Low** | `package-lock.json` | Open |
| F-12 | Framework disclosure (`X-Powered-By`) and duplicate `/gallery` route | **Info** | `next.config.mjs`, `src/app/gallery` | Open |
| F-13 | Avatar ships device EXIF metadata and is 3.4 MB | **Info** | `public/images/avatar.jpg` | Open |
| F-14 | No `security.txt`, no automated dependency or code scanning | **Info** | repository | Open |

### F-01: Service account private key committed to a public repository (High)

**Evidence.** `google-sa-base64.txt` is tracked in git and contains a base64-encoded Google service account JSON key for project `portfolio-470016` (key ID ending `...3e9c8c`; value not reproduced here). It was added in the initial commit and is present in the current tree. The GitHub repository is public. Trivy's secret scanner did not flag it because the key is base64-encoded; it was found by manual review and decoding.

**Impact.** Anyone who clones the repository can authenticate as this service account. The application only requests the `drive.readonly` scope, so the confirmed impact is read access to every Drive file shared with the account. The real ceiling depends on the IAM roles granted to the account in the Google Cloud project, which could not be checked from outside. If the account holds project-level roles, treat this as Critical.

**Reasoning.** Network vector, no privileges, no user interaction, confidentiality impact bounded by an unknown IAM scope: High.

**Fix.** Delete the file from the tree, add it to `.gitignore`, and keep credentials only in Vercel environment variables. History is intentionally not rewritten: the key must be treated as compromised regardless, so the remediation is rotation, not deletion. **Rotation is a manual step (section 6).**

### F-02: Dangling domain as base URL (Medium)

**Evidence.** `baseURL` was `https://houssamclap.dev`. The `.dev` registry RDAP service returns 404 for this name and DNS returns NXDOMAIN, so the domain is not registered. It was used for `og:url`, `og:image`, `twitter:image`, canonical JSON-LD, `robots.txt`, `sitemap.xml`, and the OG image route fetched the avatar from it server-side.

**Impact.** Anyone could register the domain and then control the preview image and canonical link shown whenever the portfolio is shared, and receive server-side requests from the OG route. Content spoofing and SEO hijacking, no code execution on the site.

**Fix.** Set `baseURL` to the deployed origin and remove every reference to the unowned domain.

### F-03: Outdated Next.js (High)

**Evidence.** `next@15.3.8`. `npm audit` lists 33 advisories against it, including three critical "unauthenticated RCE" issues in the Image Optimization API and on Windows-hosted servers (GHSA-2xp9-vwfh-vxw4, GHSA-2464-fhr4-w9xw, GHSA-p293-qw3h-jr36) and several high-severity Server Components DoS issues. All are fixed in `15.5.28`.

**Specific CVEs requested:**
- **CVE-2025-29927** (middleware authorization bypass): fixed in 15.2.3, and the site had no middleware. Not affected.
- **CVE-2025-55182** (React Server Components RCE): Next.js vendors the affected `react-server-dom-*` code; 15.3.x was fixed in 15.3.6. Not affected at 15.3.8.

**Reasoning.** On Vercel, image optimization runs on the platform rather than in the app's `next` runtime, and the site is not Windows-hosted, which lowers real exploitability of the critical items. The remaining high DoS advisories do apply. Rated High rather than Critical for that reason.

**Fix.** Upgrade to the latest 15.x (`15.5.28`) and React 19 to the latest patch, in its own commit, then re-test.

### F-04: `/api/mdx-parse` Drive query injection (Medium)

**Evidence.** The handler interpolates the user-supplied `slug` directly into a Drive API query string: `... and name = '${slug}' and ...`. A slug containing a quote can rewrite the filter so it matches folders outside the intended parent, after which the handler returns the raw content of any `index.mdx` it finds. No page calls this endpoint. Errors are returned to the caller verbatim.

**Impact.** Read access to Drive content visible to the service account but outside the intended folder, and unauthenticated consumption of Drive API quota.

**Fix.** Remove the endpoint and the unused client code that called it.

### F-05: Missing security headers (Medium)

**Evidence.** Production returned only `Strict-Transport-Security` (Vercel default). No `Content-Security-Policy`, `X-Frame-Options` / `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`.

**Impact.** The site can be framed (clickjacking), and there is no defense-in-depth against script injection. No injection sink was found (see section 4), so this is hardening rather than an exploitable issue.

**Fix.** Nonce-based CSP via middleware plus a static header set; see section 5.

### F-06: Forgeable auth cookie in unused password feature (Low)

**Evidence.** `/api/authenticate` compares the password with `===` (not constant time), has no rate limiting, and on success sets `authToken=authenticated`. `/api/check-auth` only checks that literal value, so anyone can set the cookie by hand and pass. The guard is client-side only, so a "protected" page's content would also be present in the server HTML. No route is configured as protected, so nothing is exposed today.

**Fix.** Remove the feature (routes, cookie dependency, password UI in `RouteGuard`).

### F-07: Unused contact endpoint (Low)

**Evidence.** `/api/contact` sends email through SMTP with no rate limiting, CAPTCHA or origin check, and returns the raw nodemailer `info` object or exception message to the caller. It depends on `nodemailer@7.0.13`, which has SMTP command injection advisories. No page uses it. Whether SMTP variables are set in production was not tested, to avoid sending email.

**Fix.** Remove the endpoint and `nodemailer`. The site keeps a `mailto:` link.

### F-08: OG image route (Low)

**Evidence.** `title` had no length limit; each request fetched Google Fonts CSS and a font file at runtime and the avatar from `baseURL` (the dangling domain, F-02); no cache headers. The route returned 500 in production, so link previews had no image. Satori renders `title` as a text node, so HTML injection was not possible.

**Fix.** Length-limit and sanitize `title`, load the font and avatar from the deployment bundle instead of the network, add long-lived cache headers.

### F-09: Drive listing endpoint (Low)

**Evidence.** On failure the endpoint returned `Failed to list designs: ${error}`, which can include Google client internals. The client appended `?ts=Date.now()` to every request, which defeats the CDN cache so every page view triggers the full Drive fan-out (about 13 API calls).

**Fix.** Move the listing server-side into the `/designs` page with a one-hour data cache, return generic errors, remove the public endpoint.

### F-10: Image optimizer remote patterns (Low)

**Evidence.** `images.remotePatterns` allowed `drive.google.com/**` and `lh3.googleusercontent.com/**`. The designs view renders these images with `unoptimized`, so the optimizer never needed them, but the config let anyone use `/_next/image` to fetch and re-serve arbitrary content from those hosts through this deployment.

**Fix.** Remove the remote patterns entirely.

### F-11: Vulnerable and unused dependencies (Low)

**Evidence.** `npm audit` before changes: 22 vulnerable packages (1 critical, 14 high, 7 moderate). Apart from `next` (F-03), most are build-time or dev-only transitive packages. `next-mdx-remote@5.0.0` has an RCE advisory for untrusted MDX but was only used by an unused component. `@mui/*` and `@emotion/*` were installed but never imported; `lint-staged` was a runtime dependency.

**Fix.** Remove unused packages, upgrade the rest, re-run `npm audit`.

### F-12: Framework disclosure and duplicate route (Info)

`X-Powered-By: Next.js` was sent on every response. `/gallery` duplicated `/designs`, returning 200 from the server while the client-side guard showed a 404. **Fix:** `poweredByHeader: false`, delete `/gallery`.

### F-13: Avatar metadata (Info)

`public/images/avatar.jpg` is a 4032×3024, 3.4 MB phone photo with EXIF device make, model, firmware and capture time. No GPS data. **Fix:** strip metadata and resize.

### F-14: No disclosure policy or automated scanning (Info)

**Fix:** add `/.well-known/security.txt` (RFC 9116), Dependabot for npm and GitHub Actions, and a CodeQL workflow.

## 4. Areas reviewed with no issue found

- **XSS sinks:** the only `dangerouslySetInnerHTML` is the theme bootstrap script in `layout.tsx`, built from a static config object with `JSON.stringify`; no user input reaches it. Drive file names in the designs view are rendered as React text nodes (escaped). No MDX is rendered from untrusted sources.
- **`javascript:` URLs:** none.
- **Client-exposed env vars:** no `NEXT_PUBLIC_*` variables. The Drive credentials are read only in server code.
- **Source maps:** `productionBrowserSourceMaps` is not enabled.
- **Cookies and analytics:** none set on page views.
