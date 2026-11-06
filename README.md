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

See [the project specification](docs/PROJECT.md) for scope, architecture, and next milestones. Supabase integration is scaffolded; online multiplayer and AI calls are not enabled in this first slice. No deployment has been approved. Browser interaction QA is still pending because the session preview was unreachable.

## Workflow

Work on `feat/*`, `fix/*`, or `docs/*` branches and open a pull request into `main`. Do not deploy, add paid services, or change the major architecture without Yoon's approval. Never commit secrets.
