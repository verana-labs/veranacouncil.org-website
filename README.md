# veranacouncil.org

Institutional website of the **Verana Council Association** — the governance body for the [Verana Network](https://verana.network).

Built with [Next.js 15](https://nextjs.org) + [Tailwind CSS v4](https://tailwindcss.com).

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t veranacouncil-website .
docker run -p 3000:3000 veranacouncil-website
```

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
