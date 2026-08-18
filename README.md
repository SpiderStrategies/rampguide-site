# rampguide-site

The rampguide.com website. Currently a single static placeholder page —
no build step, no framework, no dependencies.

- `index.html` — the whole site.
- `CNAME` — created automatically by GitHub when the custom domain is set;
  leave it committed.

## Deployment (GitHub Pages)

Hosted on GitHub Pages, deploying straight from `main`. Every push to
`main` republishes the site.

One-time setup:

1. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: `main`, folder `/ (root)`.
2. Under **Custom domain**, enter `rampguide.com` and save. GitHub commits
   a `CNAME` file to the repo.
3. DNS for rampguide.com:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` `CNAME` → `spiderstrategies.github.io`
4. Once DNS propagates and the cert issues, check **Enforce HTTPS**.
5. Org → **Settings → Pages → Verified domains**: verify `rampguide.com`
   (prevents domain takeover if the Pages site is ever deleted).

Note: publishing Pages from a private repo requires a paid GitHub plan.
The published site is public regardless of repo visibility.

