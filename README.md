# Our Little World

A shared, browser-based 2D life simulation. First playable slice: explore a garden, enter a cottage, sit at your desk, talk to a neighbor, try local messages and activity logs, and sketch ideas at a construction site.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the printed local URL. Use WASD / arrow keys to walk and E / Space to interact. Touch controls are available on small screens. No credentials are needed for the offline prototype.

```sh
npm test
npm run build
```

See [the project specification](docs/PROJECT.md) for scope, architecture, and next milestones. Supabase integration is scaffolded; online multiplayer and AI calls are not enabled in this first slice. The first prototype is live at https://yoonjoonso.github.io/little-world/. Viewport-filling interface changes are pending review and deployment approval. Browser interaction QA is still pending because the session preview was unreachable.

## Workflow

Work on `feat/*`, `fix/*`, or `docs/*` branches and open a pull request into `main`. Do not deploy, add paid services, or change the major architecture without Yoon's approval. Never commit secrets.

## Online preview hosting

The GitHub Pages workflow publishes the static game after approved changes merge into `main`. First enable repository **Settings → Pages → Source → GitHub Actions**. The workflow installs dependencies, runs tests, builds `dist/`, and deploys the build. No custom domain, Supabase configuration, or paid hosting account is needed for this prototype.

Merging to `main` publishes changes, so obtain Yoon's deployment approval before each merge. The hosted prototype remains single-player until Supabase multiplayer is implemented.
