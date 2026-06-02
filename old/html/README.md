# `veranacouncil.org` — static site

Static HTML + Tailwind build of the Verana Council Association website, implementing the content spec at `../spec.md`.

## Stack

- **HTML5** — hand-authored, semantic, accessible (no framework).
- **Tailwind CSS** — via Play CDN (`cdn.tailwindcss.com`) with inline config. Fine for review and preview; for production, compile via CLI (see below).
- **Fonts** — Inter (body) + IBM Plex Mono (mono), Google Fonts.
- **JS** — ~2 KB vanilla JS for mobile nav, announcement bar dismiss, and cookie consent. No third-party trackers.

## Layout

```
html/
├── index.html                       (/)
├── about/{mission,structure,history}/index.html
├── governance/
│   ├── index.html
│   └── {network-gf,ecs-egf,template-egf,risk-management,dispute-resolution}/index.html
├── seats/index.html
├── members/index.html
├── meetings/{index,schedule/index,archive/index}.html
├── join/{index,founding-member/index,public-sector-observer/index,apply/index}.html
├── standards/index.html
├── code-of-conduct/index.html
├── bylaws/index.html
├── news/index.html
├── press/{index,kit/index}.html
├── contact/index.html
├── legal/{entities,privacy,terms,cookies}/index.html
├── 404.html
├── assets/
│   ├── css/site.css
│   ├── js/site.js
│   └── img/{favicon.svg, favicon-mark.svg, og-default.svg}
└── README.md
```

## Preview locally

Any static file server works. From this directory:

```bash
python3 -m http.server 4173
# or
npx serve .
```

Then open <http://localhost:4173/>.

## Colors (spec §2.1)

| Token | Hex | Role |
|---|---|---|
| `indigo-primary` | `#2E2A8F` | Institutional lead |
| `verana-purple` | `#763EF0` | Accent, brand tie-back |
| `surface` | `#FAFAF8` | Page background |
| `ink` | `#111111` | Body copy |
| `muted` | `#5B5B5B` | Secondary text |
| `rule` | `#E8E6E0` | Dividers and rules |

## Production build (Tailwind CLI)

The CDN build is appropriate for review and staging. For production:

```bash
npm init -y
npm install -D tailwindcss@3
npx tailwindcss init
# Configure content: ['./**/*.html'] and the theme.extend from tailwind.config.js in this repo.
npx tailwindcss -i assets/css/site.src.css -o assets/css/site.css --minify
```

Then replace the `<script src="https://cdn.tailwindcss.com">` tag in each page with a `<link rel="stylesheet" href="/assets/css/site.css">`.

## Deployment

Any static host. Targets:

- GitHub Pages (CNAME `veranacouncil.org`).
- Netlify / Cloudflare Pages.
- The Council's own infrastructure once the Association incorporates.

## License

Content: CC-BY-SA 4.0. Source HTML/CSS/JS: Apache-2.0 (same as the parent repository).
