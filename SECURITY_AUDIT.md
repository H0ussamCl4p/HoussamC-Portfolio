# Security Audit: houssamc-portfolio.vercel.app

| | |
|---|---|
| **Target** | Personal portfolio, Next.js App Router on Vercel (`https://houssamc-portfolio.vercel.app`) and its source repository |
| **Date** | 3 November 2026 |
| **Auditor** | Houssam Choubik, with AI-assisted review (Claude Code) |
| **Type** | White-box review of source and git history, plus non-destructive black-box checks against production |
| **Result** | 14 findings: 2 High, 3 Medium, 6 Low, 3 Info. 13 fixed in code; 1 (F-01) needs a credential rotation outside the repository. |

> Publish or link this report only after the F-01 rotation is done.

## 1. Scope and methodology

**In scope:** all code in this repository (routes, API route handlers, middleware, components, config), the full git history, npm dependencies, HTTP response headers, and third-party origins the site depends on.

**Out of scope:** Vercel and Google Cloud account settings (reviewed only from the outside, recommendations in section 7), denial-of-service testing, and anything beyond read-only requests against production. No form was submitted and no email was sent during testing.

**Method**

1. **Recon:** enumerated every route and route handler from `src/app/**` and requested each one in production to record status codes.
2. **Secrets:** manual grep of the working tree and of `git log --all -p` for key formats (Google, GitHub, OpenAI, Slack, PEM, base64-encoded JSON), plus `trivy fs --scanners secret`.
3. **Dependencies:** `npm audit`, and the installed `next` / `react` versions checked against GitHub Security Advisories, with explicit checks for CVE-2025-29927 and CVE-2025-55182.
4. **Code review:** each route handler for input validation, SSRF, injection, auth and error handling; every `dangerouslySetInnerHTML`, MDX renderer and place external data is rendered.
5. **Headers:** `curl -D -` against production before the changes, and against a local production build (`next build && next start`) after them.
6. **Domains:** DNS (`dns.google`) and registry RDAP lookups for every domain referenced in config.
7. **Regression:** CSP rolled out as `Content-Security-Policy-Report-Only` first, every page loaded and exercised in Chromium with the console checked for violations, then enforced and re-tested.

**Tools:** curl, git, npm audit, Trivy 0.69.3, Python/Pillow (image metadata), Chromium DevTools, Lighthouse 12.8.2.

## 2. Attack surface

| Route | Before | After |
|---|---|---|
| `/` | Static HTML (ISR) | Dynamic HTML with per-request CSP nonce |
| `/about` | 307 to `/#about` | Unchanged |
| `/designs` | HTML shell, Drive data fetched client-side from `/api/drive-designs` | Server-rendered from a server-only module with a 1 h cache |
| `/gallery` | Duplicate of `/designs`, served 200 despite a client-side "404" | Removed |
| `/api/og/generate` | Any `title`, fetched fonts and avatar at runtime, **500 in production** | Allowlisted titles only, no outbound requests, cached |
| `/api/drive-designs` | Public JSON listing, ~13 Drive API calls per uncached hit | Removed |
| `/api/mdx-parse` | Unused, unauthenticated Drive file reader | Removed |
| `/api/contact` | Unused SMTP sender | Removed |
| `/api/authenticate`, `/api/check-auth` | Unused password feature | Removed |
| `/api/github-public` | 410 stub | Removed |
| `/robots.txt`, `/sitemap.xml` | Pointed at the dangling domain | Point at the deployed origin; `/api/` disallowed |
| `/.well-known/security.txt` | Missing | Added |
| `middleware` | None | Sets the CSP nonce on HTML pages only |

No server actions exist.

**External origins (after):** `drive.google.com` and `lh3.googleusercontent.com` for design thumbnails (images only), `www.googleapis.com` for the Drive API (server-side only), `github.com` and `www.linkedin.com` (outbound links only). Fonts are self-hosted by `next/font` at build time. No analytics, no third-party scripts, no cookies.

## 3. Findings

Severity uses CVSS-style reasoning (attack vector, privileges, user interaction, impact) adjusted to the context of a personal site.

| ID | Title | Severity | Affected | Status |
|---|---|---|---|---|
| F-01 | Google Cloud service account private key committed to a public repository | **High** | Repository history | **Needs Houssam** (removed from tree; key must be rotated) |
| F-02 | Dangling, unregistered domain used as the site's base URL | **Medium** | `src/resources/once-ui.config.ts` | Fixed |
| F-03 | Outdated Next.js with known critical and high advisories | **High** | `package.json` | Fixed |
| F-04 | Unused `/api/mdx-parse` endpoint with Drive query injection | **Medium** | `src/app/api/mdx-parse` | Fixed (removed) |
| F-05 | Missing security headers (CSP, framing, MIME sniffing, referrer, permissions) | **Medium** | All routes | Fixed |
| F-06 | Unused password-protection feature with a forgeable cookie | **Low** | `src/app/api/authenticate`, `check-auth`, `RouteGuard.tsx` | Fixed (removed) |
| F-07 | Unused `/api/contact` endpoint without rate limiting, leaking internal errors | **Low** | `src/app/api/contact` | Fixed (removed) |
| F-08 | OG image route: arbitrary text, runtime third-party fetches, no caching, broken in production | **Low** | `src/app/api/og/generate/route.tsx` | Fixed |
| F-09 | Drive listing endpoint: error detail leakage, cache-busting multiplies API calls | **Low** | `src/app/api/drive-designs`, `DesignsView.tsx` | Fixed |
| F-10 | Image optimizer allowed to proxy any path on two Google hosts | **Low** | `next.config.mjs` | Fixed |
| F-11 | Vulnerable and unused npm dependencies | **Low** | `package-lock.json` | Fixed; residual items accepted (section 6) |
| F-12 | Framework disclosure (`X-Powered-By`) and duplicate `/gallery` route | **Info** | `next.config.mjs`, `src/app/gallery` | Fixed |
| F-13 | Avatar ships device EXIF metadata and is 3.4 MB | **Info** | `public/images/avatar.jpg` | Fixed |
| F-14 | No `security.txt`, no automated dependency or code scanning | **Info** | Repository | Fixed (contact address pending) |

### F-01: Service account private key committed to a public repository (High)

**Evidence.** A base64-encoded Google service account JSON key was committed in the repository's first commit and was still present in the working tree. The GitHub repository is public. Trivy's secret scanner did not flag it because the key is base64-encoded; it was found by manual review and decoding. Key material is not reproduced here.

**Impact.** Anyone with a copy of the repository history can authenticate as this service account. The application only requests the `drive.readonly` scope, so the confirmed impact is read access to every Drive file shared with the account. The ceiling depends on the IAM roles the account holds in its Google Cloud project, which could not be checked from outside. If it holds project-level roles, treat this as Critical.

**Reasoning.** Network vector, no privileges, no user interaction, confidentiality impact bounded by an unknown IAM scope: High.

**Fix.** File deleted from the tree, pattern added to `.gitignore`, credentials now expected only in Vercel environment variables (`.env.example` lists the names). History was intentionally not rewritten: the key has been public, so it must be treated as compromised whether or not it is deleted. The remediation is rotation (section 7, step 1).

**Status.** Needs Houssam.

### F-02: Dangling domain as base URL (Medium)

**Evidence.** `baseURL` was a `.dev` domain that the registry's RDAP service reports as not found and that returns NXDOMAIN, so it is not registered. It fed `og:url`, `og:image`, `twitter:image`, JSON-LD, `robots.txt`, `sitemap.xml`, and the OG route fetched the avatar from it server-side.

**Impact.** Anyone could register the domain and control the preview image and canonical link shown whenever the portfolio is shared, and receive server-side requests from the OG route. Content spoofing and SEO hijacking, no code execution on the site.

**Fix.** `baseURL` is now `https://houssamc-portfolio.vercel.app`. No reference to the old domain remains in code or config. The OG route no longer fetches anything over the network.

**Status.** Fixed.

### F-03: Outdated Next.js (High)

**Evidence.** `next@15.3.8`. `npm audit` listed 33 advisories against it, including three critical unauthenticated RCE issues (GHSA-2xp9-vwfh-vxw4 and GHSA-2464-fhr4-w9xw in the Image Optimization API, GHSA-p293-qw3h-jr36 on Windows-hosted servers) and several high-severity Server Components DoS issues.

**Specific CVEs requested:**
- **CVE-2025-29927** (middleware authorization bypass): fixed in 15.2.3, and the site had no middleware. Not affected before or after. The new middleware only sets headers and makes no authorization decision.
- **CVE-2025-55182** (React Server Components RCE): Next.js vendors the affected `react-server-dom-*` code; 15.3.x was fixed in 15.3.6. Not affected at 15.3.8, and not affected at 15.5.28.

**Reasoning.** On Vercel, image optimization runs on the platform rather than in the app's `next` runtime, and the site is not Windows-hosted, which lowers real exploitability of the critical items. The high DoS advisories did apply. High rather than Critical for that reason.

**Fix.** `next` 15.5.28 (latest 15.x), `react` / `react-dom` 19.3.1, `eslint-config-next` 15.5.28, in a dedicated commit, followed by a full rebuild and re-test. No major-version upgrade was needed.

**Status.** Fixed.

### F-04: `/api/mdx-parse` Drive query injection (Medium)

**Evidence.** The handler interpolated the user-supplied `slug` directly into a Drive API query string. A slug containing a quote could rewrite the filter so it matched folders outside the intended parent, after which the handler returned the raw content of an `index.mdx` it found there. No page called this endpoint, and errors were returned verbatim.

**Impact.** Read access to Drive content visible to the service account but outside the intended folder, and unauthenticated use of Drive API quota.

**Fix.** Endpoint and the unused client code that called it removed. The remaining Drive code (`src/lib/drive-designs.ts`) only interpolates IDs that match a strict `[A-Za-z0-9_-]` pattern and is not reachable with user input.

**Status.** Fixed.

### F-05: Missing security headers (Medium)

**Evidence.** Production returned only `Strict-Transport-Security` (Vercel's default). No CSP, no framing protection, no `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`.

**Impact.** The site could be framed (clickjacking), and there was no defense-in-depth against script injection. No injection sink was found (section 4), so this was hardening rather than an exploitable issue.

**Fix.**
- `src/middleware.ts` generates a fresh nonce per request and sends `script-src 'self' 'nonce-…' 'strict-dynamic'` (no `unsafe-inline`, no `unsafe-eval` in production), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `frame-src 'none'`, `img-src` limited to self, data/blob and the two Drive image hosts, `connect-src 'self'`, `upgrade-insecure-requests`. `style-src` keeps `'unsafe-inline'` because the UI library sets inline `style` attributes, which cannot carry a nonce.
- `next.config.mjs` adds HSTS (2 years, subdomains, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that disables camera, microphone, geolocation, payment, USB, serial and similar features, `Cross-Origin-Opener-Policy: same-origin`, and `default-src 'none'` on `/api/*`.
- Rollout: report-only first (`CSP_REPORT_ONLY=1`). Zero violations on `/`, `/designs`, `/about` and the 404 page in a production build, then enforced and re-tested (navigation, theme toggle, section links, carousel). Every executable `<script>` in the HTML carries the nonce.

**Status.** Fixed.

### F-06: Forgeable auth cookie in unused password feature (Low)

**Evidence.** `/api/authenticate` compared the password with `===` (not constant time), had no rate limiting, and on success set a cookie with a fixed literal value that `/api/check-auth` accepted, so the cookie could be set by hand. The guard ran client-side only, so a "protected" page's content would also have been in the server HTML. No route was configured as protected.

**Fix.** Feature removed (both routes, the `cookie` dependency, and the password UI in `RouteGuard`, which was deleted). Disabled routes now return a real 404 from the server via `notFound()`.

**Status.** Fixed.

### F-07: Unused contact endpoint (Low)

**Evidence.** `/api/contact` sent email through SMTP with no rate limiting, CAPTCHA or origin check, and returned the raw nodemailer `info` object or exception message. It depended on `nodemailer@7.0.13`, which has SMTP command injection advisories. No page used it.

**Fix.** Endpoint and `nodemailer` removed. The site keeps email contact, but the address is assembled in the browser on click and no longer appears in the HTML or as a `mailto:` link.

**Status.** Fixed.

### F-08: OG image route (Low)

**Evidence.** `title` had no length limit and any text could be rendered onto an image served from this domain; each request fetched Google Fonts CSS, a font file and the avatar (from the dangling domain) over the network; no cache headers. The route returned 500 in production, so shared links had no preview image. Satori renders text nodes, so HTML injection was not possible.

**Fix.** Only titles defined in the content files are rendered; anything else falls back to the site title (verified: a `<script>` title produces a byte-identical default image). The avatar is read from the deployment bundle, no fonts are fetched, and responses carry `Cache-Control: public, max-age=86400, s-maxage=604800`.

**Status.** Fixed.

### F-09: Drive listing endpoint (Low)

**Evidence.** On failure the endpoint returned `Failed to list designs: ${error}`, which can include Google client internals. The client added a timestamp to every request, defeating the CDN cache, so every page view triggered the full Drive fan-out. In production that call took about 2.8 s before any image could start loading, and crawlers saw only "Loading designs...".

**Fix.** The listing moved into a `server-only` module used by the `/designs` page, cached for an hour with `unstable_cache`. Errors are logged server-side and the page shows a generic message. Thumbnails after the first three are lazy-loaded. The public endpoint was removed.

**Status.** Fixed.

### F-10: Image optimizer remote patterns (Low)

**Evidence.** `images.remotePatterns` allowed `drive.google.com/**` and `lh3.googleusercontent.com/**`. The designs view renders these images with `unoptimized`, so the optimizer never needed them, but the config let anyone use `/_next/image` to fetch and re-serve content from those hosts through this deployment.

**Fix.** `remotePatterns` is now empty. Verified: `/_next/image` with a remote URL returns 400.

**Status.** Fixed.

### F-11: Vulnerable and unused dependencies (Low)

**Evidence.** `npm audit` before: 22 vulnerable packages (1 critical, 14 high, 7 moderate). Apart from `next` (F-03), most were build-time or dev-only transitive packages. `next-mdx-remote@5.0.0` has an RCE advisory for untrusted MDX but was only used by an unused component. `@mui/*` and `@emotion/*` were installed but never imported; `lint-staged` was a runtime dependency.

**Fix.** Removed `nodemailer`, `cookie`, `next-mdx-remote`, `gray-matter`, `@next/mdx`, `@mdx-js/loader`, `@mui/*`, `@emotion/*`, `lint-staged`; ran `npm audit fix` (no `--force`). Lockfile committed; `npm ci` verified.

**Status.** Fixed, with residual items accepted (section 6).

### F-12: Framework disclosure and duplicate route (Info)

`X-Powered-By: Next.js` was sent on every response, and `/gallery` duplicated `/designs`. **Fix:** `poweredByHeader: false`; `/gallery` deleted (now 404). Custom 404 and error pages show no framework details, digest or stack trace. `productionBrowserSourceMaps` is explicitly `false`; the build emits no `.map` files under `/_next/static`. **Status:** Fixed.

### F-13: Avatar metadata (Info)

The avatar was a 4032×3024, 3.4 MB phone photo with EXIF device make, model, firmware version and capture time (no GPS). **Fix:** orientation applied, metadata stripped, resized to 600×800 (79 KB). The other images in `public/` had no EXIF data. **Status:** Fixed.

### F-14: No disclosure policy or automated scanning (Info)

**Fix:** `/.well-known/security.txt` (RFC 9116), `.github/dependabot.yml` (npm and GitHub Actions, weekly) and a CodeQL workflow (`security-extended` queries) for JavaScript/TypeScript. **Status:** Fixed; the `Contact:` line still needs a real address (section 7).

## 4. Areas reviewed with no issue found

- **XSS sinks:** two `dangerouslySetInnerHTML` uses, both with static data: the theme bootstrap script in `layout.tsx` (built with `JSON.stringify` from config, now nonce-protected) and the Person JSON-LD on the home page (static content, `<` escaped). Drive file names are rendered as React text nodes. No MDX is rendered.
- **`javascript:` URLs:** none. The UI library also sanitizes `href` values.
- **External links:** rendered with `target="_blank"` and `rel="noopener noreferrer"` (the library default is `noreferrer`, which already implies `noopener`; set explicitly anyway).
- **Client-exposed env vars:** no `NEXT_PUBLIC_*` variables. Drive credentials are read only in `server-only` code. The only build-time `env` value is a boolean for whether the CV file exists.
- **Cookies and analytics:** none.

## 5. Header scan, before and after

| Header | Before (production) | After (local production build) |
|---|---|---|
| `Content-Security-Policy` | missing | nonce-based, `strict-dynamic`, `frame-ancestors 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (Vercel default) | same, now also set by the app |
| `X-Content-Type-Options` | missing | `nosniff` |
| `X-Frame-Options` | missing | `DENY` |
| `Referrer-Policy` | missing | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | missing | camera, microphone, geolocation, payment, USB, etc. disabled |
| `Cross-Origin-Opener-Policy` | missing | `same-origin` |
| `X-Powered-By` | `Next.js` | removed |

securityheaders.com and Mozilla Observatory grades can only be measured once this is deployed (section 7, step 6).

**`npm audit` summary**

| | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| Before | 1 | 14 | 7 | 0 | 22 |
| After | 0 | 1 | 15 | 0 | 16 |

## 6. Accepted risks

- **`postcss@8.4.31` pinned inside `next` (High in `npm audit`).** Next.js 15 bundles this version for its build pipeline. The advisories concern processing attacker-controlled CSS or source maps; this project only compiles its own stylesheets at build time, and nothing reaches PostCSS at runtime. The only fix is Next.js 16, a major upgrade that was not needed to close any runtime issue. Dependabot will surface it.
- **`minimatch` ReDoS via ESLint and its plugins (15 Moderate).** Dev-only tooling that runs against the repository's own files, never deployed.
- **`style-src 'unsafe-inline'`.** Required by the UI library's inline `style` attributes. Script execution is still nonce-gated, and with no injection sink the remaining risk is CSS-only content manipulation.
- **Pages are now rendered per request** (needed for per-request nonces), so the HTML no longer comes from the static CDN cache. Drive data is cached separately for an hour, so this costs some time to first byte, not extra API calls.

## 7. Remaining manual steps (owner)

1. **Rotate the leaked service account key (F-01).** In Google Cloud Console > IAM & Admin > Service Accounts, open the portfolio service account, go to Keys, **delete the existing key**, and create a new one only if `/designs` should keep using Drive. While there, check the account's IAM roles: it should hold none at project level, only "Viewer" sharing on the one Drive folder. Then update `GOOGLE_SA_BASE64` in Vercel and redeploy. Check Cloud Audit Logs for activity by this account since the key was first committed.
2. **Optional history cleanup.** After rotation, the old key is harmless. Rewriting history (`git filter-repo`) is optional and was not done here.
3. **Vercel environment variables.** Scope `GOOGLE_SA_BASE64` and `DRIVE_CANVA_FOLDER_ID` to **Production** only, so preview deployments of untrusted branches can't read them. `/designs` shows a generic "not available" message on previews without them.
4. **Vercel Deployment Protection.** Enable Vercel Authentication for Preview deployments (Settings > Deployment Protection), so old deployment URLs are not public: every past deployment keeps serving the code it was built with, including endpoints removed in this audit. Delete old deployments you don't need.
5. **`security.txt` contact.** Replace `Contact: mailto:TODO(houssam)` in `public/.well-known/security.txt` with a real address.
6. **Verify after deploy:**
   ```bash
   curl -sI https://houssamc-portfolio.vercel.app/ | grep -iE "content-security|strict-transport|x-frame|x-content|referrer|permissions|cross-origin|x-powered"
   ```
   - https://securityheaders.com/?q=https%3A%2F%2Fhoussamc-portfolio.vercel.app%2F&followRedirects=on
   - https://developer.mozilla.org/en-US/observatory/analyze?host=houssamc-portfolio.vercel.app
   - Open the site with DevTools > Console and confirm no "Content Security Policy" errors on `/` and `/designs`.
7. **HSTS preload (optional).** The header qualifies, but `*.vercel.app` subdomains cannot be submitted to hstspreload.org individually; only a custom apex domain can.
8. **GitHub settings.** Enable secret scanning and push protection (Settings > Code security), so a key like F-01 is blocked at push time.
