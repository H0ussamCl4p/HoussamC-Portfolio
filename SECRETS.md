# Secrets & deployment notes

This project uses a few secrets for GitHub and Google Drive integration. This file explains where to store them locally and how to provide them to CI/CD or hosting (Vercel, GitHub Actions).

Local development

- Copy `.env.example` to `.env.local` at the project root and fill values. Do NOT commit `.env.local`.

  Example `.env.local`:

  GITHUB_TOKEN=ghp_xxx
  GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
  DRIVE_FOLDER_ID=0Bxyz...
  NEXT_PUBLIC_BASE_URL=https://yourdomain.com

- Place your `google-service-account.json` file at the path you reference (usually project root). Do NOT commit that file.

Notes about tokens

- GITHUB*TOKEN: used server-side only by `src/app/api/github-stats/route.ts`. Do not prefix with `NEXT_PUBLIC*`.
- GOOGLE_APPLICATION_CREDENTIALS: path to service account JSON for Google Drive sync script. Alternatively use `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` in CI.

Using in GitHub Actions

- Add repository secrets (Settings → Secrets → Actions): `GITHUB_TOKEN` (or a different name), `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, `DRIVE_FOLDER_ID`.
- Example step (decode service account JSON and run sync script):

  - name: Setup service account
    env:
    GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 }}
    run: |
      echo "$GOOGLE_SERVICE_ACCOUNT_JSON_BASE64" | base64 -d > ./google-service-account.json

  - name: Install & run sync
    run: |
    npm ci
    node sync-and-generate.js

Using in Vercel / Netlify

- In Vercel: Project → Settings → Environment Variables. Add `GITHUB_TOKEN`, `DRIVE_FOLDER_ID`, and (if you prefer) your base URL `NEXT_PUBLIC_BASE_URL`.
- For the Google service account, either:
  - Add the JSON as a base64 secret `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` and decode it during a build step, or
  - Upload the JSON securely to a storage the build can read (less recommended).

Security tips

- Rotate tokens if you think they were exposed.
- Limit scopes to the minimum required (for GitHub: `public_repo` is usually sufficient for reading public repo stats).
- Never commit `.env.local`, service account JSON, or tokens to git.

GitHub Actions: generate-github-stats workflow

- Add secret `GITHUB_TOKEN` (Repository Settings → Secrets → Actions). This token will be used by the workflow to call GitHub's GraphQL API.
- (Optional) Add secret `GITHUB_STATS_USER` if you want to target a different username than the default `H0ussamCl4p`.
- Trigger the workflow from the Actions tab (select "Generate GitHub Stats" → Run workflow) or let it run on schedule.
- The workflow will upload `public/github-stats.json` as an artifact. You can download it from the workflow run details if you prefer not to commit it to the repo.

Run the generator locally

- Temporarily set your token and run the npm script:

```powershell
$env:GITHUB_TOKEN = 'ghp_your_token_here'
npm run gen:github-stats
Get-Content .\public\github-stats.json | ConvertFrom-Json
```

- Or use the npm script directly if you've added `GITHUB_TOKEN` to `.env.local`:

```powershell
npm run gen:github-stats
```

If you'd like the workflow to commit the generated file back to `main` instead of uploading an artifact, tell me and I will change the workflow back to commit-and-push mode.
