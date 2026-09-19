# Carolina Heating Service — carolinaheating.com

High-fidelity Next.js port of the Carolina Heating Service WordPress site.
See [AGENTS.md](./AGENTS.md) for the architecture, how content is edited, and
how to re-sync from the live site.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all 106 pages statically generated)
npm run lint
```

## Deploy

Deployed to Vercel from the `NearU-Websites` monorepo with **Root Directory**
set to `carolina-heating`. Every push to `main` redeploys.
