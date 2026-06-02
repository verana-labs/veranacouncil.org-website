# Verana Council — Simplified Sitemap

Inspired by [hederacouncil.org](https://hederacouncil.org): a small, calm site
with a clear nav, one prominent "Join" call-to-action, and shallow depth.
Governance *documents* live in the `verana-labs/verana-council-gov` repo; this
site only summarizes and links to them — it does not reproduce them.

## Principles

- **5 top-level pages**, max one level of sub-content (no deep trees).
- **One CTA** repeated site-wide: *Apply for a Founding Council Seat*.
- **Short sections**: a heading, 1–2 sentences, and a link out. No long prose.
- **Link, don't duplicate**: frameworks, specs, and legal text link to their
  canonical sources.

## Top navigation

`About · Governance · Members · News · Contact` + **Join** button.

---

## 1. Home `/`

The one-screen pitch.

- **Hero** — "The governance body of the open public trust layer." One line +
  *Join* / *Read the frameworks* buttons.
- **What the Council is** — 3–4 short cards: Non-profit Swiss Verein ·
  One-member-one-vote · Two frameworks · Operates the chain.
- **Latest news** — 3 most recent items (auto from News).
- **Join CTA** — banner linking to Join.

## 2. About `/about`

Who the Council is and how it runs. (Merges the old mission + structure +
history pages.)

- **Mission** — 2 sentences on what the Council governs.
- **Structure** — Swiss Verein, General Assembly, Board, committees. One short
  paragraph + a link to Bylaws.
- **How we operate** — one-member-one-vote, seat-diversity rule, validator
  obligation. Bullets only.
- **Transparency** — quarterly meetings, public minutes & votes. Link to News.

## 3. Governance `/governance`

Summary + links to the canonical docs. No normative text on-site.

- **Network GF** — 1 sentence + link to repo.
- **ECS-EGF** — 1 sentence + the four-schema table (with schema JSON links).
- **Template EGF** — "a scaffold, not a gate" + link.
- **Bylaws & Code of Conduct** — one line each + links.
- All links point to `github.com/verana-labs/verana-council-gov`.

## 4. Members `/members`

The Hedera "Ecosystem" equivalent.

- **Current Members & Observers** — logo grid (placeholders pre-incorporation).
- **How seats work** — one paragraph on the (sector × region) rule.
- **Become a Member** — link to Join.

## 5. News `/news`

The public record, chronological.

- Reverse-chronological list: new Members, framework votes, sanctions,
  meeting summaries. One line each.

## 6. Contact `/contact`

- Email + intro-call link.
- Press inquiries (merge the old press kit here as a short section + download).

---

## Persistent CTA — Join `/join`

Reachable from the nav button and every page footer.

- **Two tracks** — Founding Member · Public-Sector Observer. One card each.
- **Apply** — single short form (track selectable).

## Footer

Minimal: logo, nav repeat, legal links (Privacy · Terms · Cookies), GitHub,
copyright.

---

## What gets dropped or merged vs. the current site

| Current pages | Becomes |
| --- | --- |
| `about/mission`, `about/structure`, `about/history` | one `about/` page |
| `governance/*` (6 pages) | one `governance/` summary + external repo links |
| `bylaws`, `code-of-conduct` | links on `governance/`, full text in repo |
| `meetings/*` (index, schedule, archive) | a section on `about/` + News |
| `press/index`, `press/kit` | a section on `contact/` |
| `seats`, `standards` | folded into `governance/` / `members/` |
| `join/*` (4 pages) | one `join/` page with a single form |
| `legal/*` | footer links only |
