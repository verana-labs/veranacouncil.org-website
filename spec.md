# `veranacouncil.org` — Website Content Spec (Simplified)

**Status:** Simplified rebuild. Modeled on [hederacouncil.org](https://hederacouncil.org):
a small, calm institutional site with a clear nav, one prominent *Join* CTA, and
shallow depth. Supersedes the previous long-form spec (kept at `spec.md.bak`).

This site is the **institutional front door** of the Verana Council Association.
It explains who the Council is, what it governs, who its members are, what it has
decided, and how to join. Nothing else.

**Governance documents are NOT reproduced here.** They live in
`github.com/verana-labs/verana-council-gov`. This site only summarizes and links
to them.

## Sister properties (do not duplicate)

- `verana.io` — the network / product site. Developer & builder audience.
- `docs.verana.io` — technical documentation and API reference.
- `verana-labs.github.io/verifiable-trust-spec/` — Verifiable Trust spec v4.
- `verana-labs.github.io/verifiable-trust-vpr-spec/` — VPR spec.
- `github.com/verana-labs/verana-council-gov` — Council governance documents.
- `verana.foundation` — (post-incorporation) treasury / grants / devrel. Out of scope.

---

## 1. Principles

- **5 top-level pages**, max one level of sub-content. No deep trees.
- **One CTA** repeated site-wide: *Apply for a Founding Council Seat* → `/join`.
- **Short sections**: a heading, 1–2 sentences, and a link out. No long prose.
- **Link, don't duplicate**: frameworks, specs, and legal text link to canonical
  sources.

## 2. Brand & voice

- **Body type:** Inter. **Mono:** IBM Plex Mono.
- **Primary color:** `#2E2A8F` (deep indigo). **Accent:** `#763EF0` (Verana purple).
- **Neutrals:** background `#FAFAF8`, ink `#111111`, muted `#5B5B5B`, rule `#E8E6E0`.
- **Dark mode** supported (theme toggle).
- **Voice:** neutral, institutional, factual (Linux Foundation / W3C tone). One
  voice site-wide. Avoid hype words (*revolutionary, trustless, world-class*…).
- **Prefer:** "public infrastructure", "non-profit", "verifiable", "authors and
  operates", "selects", "framework".

## 3. Navigation

**Header:** `About · Governance · Members · News` + **Join** button +
`Contact` (lightweight, right-aligned) + theme toggle.

**Footer:** logo, nav repeat, related sites (verana.io, docs.verana.io, the two
specs, GitHub), legal links (Privacy · Terms · Cookies), copyright.

**Persistent announcement bar (dismissible):**
> Founding Council recruitment is open through Q3 2026. → Apply

---

## 4. Pages

### 4.1 Home `/`

The one-screen pitch.

- **Hero** — "The governance body of the open public trust layer." One sentence +
  *Apply for a Founding Council Seat* / *Read the frameworks* buttons.
- **What the Council is** — 4 short cards: Non-profit Swiss Verein ·
  One-member-one-vote · Two frameworks · Operates the chain.
- **Latest news** — 3 most recent items, pulled from News.
- **Join CTA** — banner linking to `/join`.

### 4.2 About `/about`

Who the Council is and how it runs. Merges the old mission, structure, history,
and meetings pages.

- **Mission** — 2 sentences: the Council authors and operates the governance
  frameworks of the open public trust layer, and secures the chain they run on.
- **Structure** — non-profit Swiss Verein (Art. 60 ZGB), target incorporation
  **Q3 2026**. General Assembly, Board, committees. One paragraph + link to
  Bylaws (in the gov repo).
- **How we operate** — one-member-one-vote, seat-diversity rule (one voice per
  sector × region), validator obligation (every Member runs a node). Bullets.
- **Transparency** — quarterly meetings; minutes and voting records published.
  Link to News.
- **What the Council is not** — short bullets: not a standards body, not a product
  vendor, not a sector-EGF authority, not a grant-making body, not single-company
  controlled.

### 4.3 Governance `/governance`

A single summary page. **No normative text on-site** — every item links to
`github.com/verana-labs/verana-council-gov`.

- **Network GF** — the constitutional layer every EGF on Verana must respect.
  1 sentence + link.
- **ECS-EGF** — the Council's ecosystem framework covering the four Essential
  Credential Schemas. Includes the four-schema table:

  | Schema | Identifies | Permission mode | Definition |
  | --- | --- | --- | --- |
  | `Service` | Verifiable Services (incl. AI agents) | `ECOSYSTEM_VALIDATION_PROCESS` | service.json |
  | `Organization` | Legal entities controlling services | `GRANTOR_VALIDATION_PROCESS` | org.json |
  | `Persona` | Individuals controlling services | `GRANTOR_VALIDATION_PROCESS` | persona.json |
  | `UserAgent` | End-user wallets and applications | `OPEN` | ua.json |

  Schema links → `verana-labs.github.io/verifiable-trust-spec/schemas/v4/*.json`.
- **Template EGF** — "a scaffold, not a gate" for ecosystems authoring their own
  sector EGF. 1 sentence + link.
- **Bylaws & Code of Conduct** — one line each + links to the gov repo.
- **Risk management & disputes** — one short paragraph: graduated sanctions,
  public record, appeal to the General Assembly.

### 4.4 Members `/members`

The Hedera "Ecosystem" equivalent.

- **Members & Observers** — logo grid (placeholders pre-incorporation).
- **How seats work** — one paragraph on the (sector × region) diversity rule.
- **Become a Member** — link to `/join`.

### 4.5 News `/news`

The public record, reverse-chronological. One line per item: new Members,
framework votes, sanctions decisions, meeting summaries.

### 4.6 Contact `/contact`

- **General** — `council@verana.io` + intro-call scheduling link.
- **Press** — short section + `press@verana.io`; logos/boilerplate download
  (absorbs the old press kit).

---

## 5. Persistent CTA — Join `/join`

Reachable from the nav button and every page.

- **Two tracks**, one card each:
  - **Founding Member** (voting) — governments, standards bodies, enterprises,
    academic institutions. Co-authors the bylaws + frameworks through Q3 2026;
    operates a validator node after mainnet.
  - **Public-Sector Observer** (non-voting) — sovereigns and multilateral bodies
    that cannot sign Verein agreements under procurement / sovereign-immunity
    rules. Compatible with public-sector constraints; convertible to membership.
- **Apply** — a single short form with a selectable track. Submissions are
  confidential pre-incorporation.

---

## 6. Forms

One form (`/join`), track selectable. Fields: organization / body name, sector,
region, primary contact, short rationale/scope. Submit wires to the Council's
intake endpoint in production (placeholder `mailto:` acceptable for static build).

## 7. Legal & privacy

- **Entity:** Verana Council Association, a non-profit Swiss Verein (Art. 60 ZGB),
  in formation; target incorporation Q3 2026. Seat: `[SEAT_CITY]`, `[CANTON]`.
- **Privacy** — GDPR; essential + (consented) analytics cookies only; no data
  sale; contact `privacy@verana.io`; complaint to Swiss FDPIC / local EU DPA.
- **Footer legal links only:** Privacy · Terms · Cookies.
- **Content license:** site text CC-BY-SA 4.0; brand assets CC-BY 4.0.

## 8. Out of scope (explicitly dropped)

- **Public Policy** page — not for now.
- Deep governance sub-pages, dedicated `seats`, `standards`, `meetings/*`,
  `press/kit`, `legal/entities`, and multi-page `join/*` and `about/*` trees.
- Anything product/developer (→ `verana.io`, `docs.verana.io`) or
  treasury/grants (→ `verana.foundation`).

## 9. Migration map (old → new)

| Old pages | New |
| --- | --- |
| `about/mission`, `about/structure`, `about/history`, `meetings/*` | one `/about` |
| `governance/*` (6 pages), `bylaws`, `code-of-conduct`, `standards`, `seats` | one `/governance` summary + gov-repo links (`seats` note folded into `/members`) |
| `members` | `/members` (kept, simplified) |
| `news` | `/news` (kept) |
| `press/index`, `press/kit` | section on `/contact` |
| `join/*` (4 pages) | one `/join` with a single form |
| `legal/*` | footer links only |
