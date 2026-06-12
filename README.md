# veranacouncil.org

Institutional site **and member console** of the **Verana Council Association** —
the governance body of the open public trust layer: the sole body that governs
and secures the live [Verana](https://verana.io) network.

The site is two things at once (see [`spec.md`](spec.md)):

1. **The institutional front door** — who the Council is, what it governs
   (Network GF · ECS-EGF · Template EGF), the live **seat matrix**
   (sector × region), the member directory, and the generated **public record**
   (`/news`).
2. **The point of contact and point of action** for members and observers — a
   signed-in console for the **candidacy flow** (pick an open seat, e-sign the
   Candidate Agreement, vetting, FIFO queue), the **provisional admission
   ballots** (one ballot per candidate, ⅔ of seated members, async 14-day
   window — sunsets at mainnet, when Council voting moves on-chain),
   organization access lists, and Council bodies/meetings with published
   minutes.

Built on the [veranafoundation.org](https://github.com/verana-labs/veranafoundation.org-website)
platform: Next.js 15 + Tailwind v4 + Prisma/Postgres + Auth.js v5 (passwordless),
e-signature with PDF generation, Google Calendar-synced meetings, Relaticle CRM
contact intake.

## Development

```bash
npm install
cp .env.example .env.local   # fill in at least DATABASE_URL + AUTH_SECRET
npm run db:up                # local Postgres (docker compose)
npm run db:deploy            # apply migrations
npm run db:seed              # admin allowlist + seat matrix + candidate agreement
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests & build

```bash
npm test        # vitest
npm run build   # prisma generate + next build
```

## Docker

```bash
docker build -t veranacouncil-website .
docker run -p 3000:3000 veranacouncil-website
```

## Operations

- `POST /api/cron/ballots` (Bearer `CRON_SECRET`) — closes admission ballots
  whose window ended; hit daily from an external scheduler.
- The Candidate Agreement in `legal/` is a **clearly-marked DRAFT placeholder**
  until the reviewed agreement lands; admins manage versions in
  `/admin/settings`.

## CI/CD

| Trigger | Action |
| --- | --- |
| Push / PR → `main` | Type-check + Next.js build |
| Push → `main` | Docker image pushed to `veranalabs/veranacouncil-website:latest` |
| Tag `v*` | Docker image pushed with semver tags |

Requires repository secrets `DOCKER_HUB_LOGIN` and `DOCKER_HUB_PWD`.

## Release management

Releases are automated with [release-please](https://github.com/googleapis/release-please). Merge commits following [Conventional Commits](https://www.conventionalcommits.org) to `main` and release-please will open a release PR and tag automatically.

## License

[Apache-2.0](LICENSE)
