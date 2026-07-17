# `veranacouncil.org` — Website Content Spec

**Status:** Full rebuild of `verana-labs/veranacouncil.org-website`. Supersedes the
repo's previous `spec.md` and `sitemap-simpler.md`, and abandons the
`Initial-Council-Member-MoU-v1` (the binding Council Membership Agreement will be drafted).
**Source of truth for all entity facts: the Verana Council section of
[`defs.md`](../defs.md).** Where this spec and defs.md disagree, defs.md wins.

Shares the **information architecture** of the sister
[`veranafoundation.org` spec](../foundation-website/spec.md) — small, clear nav,
shallow depth, one prominent CTA — but is deliberately a **distinct sister
sub-brand, not a twin**. The Foundation is an *open-source commons* (builder
energy); the Council is a *constitution / governance body* (institutional
gravitas). They share the Verana logo, the purple, and the accessibility baseline
so they read as family, but diverge in color, type, layout, imagery, and voice
(see §2). The Foundation site's CTA is *Join*; this site's CTA is **Apply for a
Founding Council Seat** → `/join`.

This site is two things at once:

1. **The institutional front door** of the Verana Council Association — who the
   Council is, what it governs, who its members are, what it has decided, how to
   join.
2. **The point of contact AND point of action for members and observers** — a
   signed-in **Council console** where candidacy, seating, organization
   management, meetings, and (provisionally, pre-mainnet) admission votes
   actually happen. Every console action emits a public artifact, so
   transparency is the exhaust of the machine, not an editorial task.

**The Council is in formation.** Non-profit Swiss Verein (Art. 60 ZGB), target
incorporation Q4 2026; while in formation, 2060 OÜ acts as steward
(pre-incorporation). The site states this plainly wherever entity status is
described.

**The Council's mandate — neutrality, governance & network security.** Reflect
this exactly; it is the spine of the whole site:

- **The sole body that governs and secures the live Verana network** — only
  Council members may, and must, run a validator node. All other modules
  (Indexer, Trust Resolver, Graph, …) are permissionless, since their data is
  derived from the ledger.
- **Authors and operates the governance frameworks** — the **Network GF** (the
  constitutional layer every EGF must respect), the **ECS-EGF** (the five
  Essential Credential Schemas), and the **Template EGF** (a scaffold for sector
  ecosystems).
- **One-member-one-vote**, seat-diversity rule (broad spread across sectors and
  regions, capped at **25** Founding Member seats), **⅔ supermajority** for any
  protocol-governance change, fixed validator terms with formal renewal.
- **Membership is free** — no dues, no capital contribution, either track; the
  statutes exclude personal financial liability of members (Art. 75a ZGB).
  Funded by 2060 OÜ (stewardship) before network launch, then by a
  protocol-defined on-chain allocation.
- **Two membership tracks** — **Founding Member** (voting; governments,
  standards bodies, enterprises, academia) and **Public-Sector Observer**
  (non-voting; sovereigns and multilateral bodies that often cannot join a Swiss
  Verein). Founding Council recruitment open through **Q4 2026**.

**Hard limits — the Council is NOT, and the site must NEVER imply it is:** a
standards body (the specs are owned and hosted by the Foundation), a product
vendor, a sector-EGF authority, a grant-making body, the issuer or owner of the
VNA token, or single-company controlled. It is **fully separate** from the
Verana Foundation. Specifications, open-source software, token issuance, and
ecosystem growth are the Foundation's domain (→ `veranafoundation.org`).

## Sister properties (do not duplicate)

- `veranafoundation.org` — the Foundation: owns/hosts the specs, stewards the
  open-source software, issues & administers VNA, grows the ecosystem. **Fully
  separate** from the Council.
- `verana.io` — the network / product site and **the** "how to build on Verana"
  surface. This site links there; it does not reproduce build content.
- `docs.verana.io` — technical documentation and API reference.
- `verana-labs.github.io/verifiable-trust-spec/versions/v4/` — Verifiable Trust
  spec v4 (stable; the repo root serves the v5 draft).
- `verana-labs.github.io/verifiable-trust-vpr-spec/` — VPR spec v4.
- `github.com/verana-labs/verana-council-gov` — the Council's governance
  documents (frameworks, bylaws, code of conduct). **Normative text lives there;
  this site only summarizes and links.**
- `github.com/verana-labs/working-groups` — published minutes (shared pattern
  with the Foundation; the Council publishes its session records the same way,
  to `verana-council-gov`).
- `2060.io` / `hologram.zone` — 2060 and its commercial product. The Council
  does not market products; 2060 appears only as one member among many.

---

## 1. Principles

- **6 top-level pages**, max one level of sub-content. No deep trees.
- **One CTA** repeated site-wide: *Apply for a Founding Council Seat* → `/join`.
- **Short sections**: a heading, 1–2 sentences, and a link out. No long prose.
- **Link, don't duplicate**: frameworks, specs, and legal text link to canonical
  sources. The site is a front door and a console, not a content silo.
- **Stay in lane**: nothing about specs/software stewardship, token issuance, or
  grants (→ Foundation), nothing that is a build tutorial (→ verana.io / docs),
  nothing commercial (→ hologram.zone / 2060.io).
- **The record is generated, not written**: `/news` is the automatic output of
  actions taken in the console (admission ballots, seatings, minutes). No
  marketing blog. An organization is named publicly only once accepted/seated
  (and admin-listed); applications aren't published, and a ballot in progress
  shows by sector/region without the candidate's name.
- **Show the constitution**: the signature visual element is the **live seat
  board** — *seats filled of 25* plus the spread across sectors and regions, an
  anonymous, inviting recruitment surface (an open seat is an invitation). It is
  **not** a sector × region grid (that earlier design read as complex and
  off-putting). The Foundation's signature is community activity; the Council's
  is governance structure.

## 2. Brand & voice

**Personality: a constitution / governance body** (Linux Foundation / W3C /
Swiss-institution gravitas) — calm, formal, factual, austere. A sister sub-brand
of the Foundation: shared DNA, distinct character.

**Shared with the Foundation (the family DNA — keep):** the Verana logo system,
the Verana purple, dark-mode support (theme toggle), and the WCAG-AA
accessibility baseline.

**Where the Council diverges (its own personality):**

- **Color** — lead with **`#2E2A8F` (deep indigo) as the primary** (authority,
  permanence); `#763EF0` (Verana purple) demoted to accent. **Never** the
  Foundation's signal green — the Council has no "growth" accent; its palette is
  ink, indigo, and paper.
- **Neutrals:** background `#FAFAF8`, ink `#111111`, muted `#5B5B5B`, rule `#E8E6E0`.
- **Type** — **all-Inter** (headings and body; no display face — the absence of
  Space Grotesk is itself the signal vs. the Foundation). **Mono: IBM Plex
  Mono**, used sparingly — seat-board figures, schema names, dates of record.
- **Layout** — formal, generous whitespace, predominantly **one-column
  institutional prose blocks** and tables; no card mosaics, no contributor
  avatars, no activity feeds. The seat board and the five-schema table are the
  only dense visual structures.
- **Imagery & motion** — minimal to none: no stock photos, no illustration
  system, no scroll animations. Structure (tables, rules, numbering) *is* the
  aesthetic.
- **Signature element it owns** — the **live seat board** (see §1) and the
  numbered public record.

**Voice:** institutional, present-tense, declarative. The Council "authors,
operates, selects, governs, admits, records." Avoid hype (*revolutionary,
trustless, world-class*), marketing superlatives, and exclamation marks. No
investment/price framing; VNA is mentioned only as the token the Council
explicitly does **not** issue or own.

- **Prefer:** "governs", "secures", "authors and operates", "one member, one
  vote", "seat", "framework", "public record", "non-profit Swiss Verein",
  "validator", "admission", "ratified".

## 3. Navigation

**Header:** `About · Governance · Members · News`, an **Apply** button
(*Apply for a Founding Council Seat* → `/join`), a **Sign in** link (→ console),
and a theme toggle.

**Footer:** logo, nav repeat, `Contact`, related sites (veranafoundation.org,
verana.io, docs.verana.io, the two specs, verana-council-gov, GitHub), legal
links (Privacy · Terms · Cookies), copyright + content license.

**Persistent announcement bar (dismissible):**
> Founding Council recruitment is open through Q4 2026. → Apply

---

## 4. Pages

### 4.1 Home `/`

The one-screen statement. Sections in order:

- **Hero** — "The governance body of the open public trust layer." One sentence
  (the Council authors and operates the governance frameworks of the Verana
  network and is the sole body that governs and secures it) + *Apply for a
  Founding Council Seat* / *Read the frameworks* buttons.
- **What the Council is** — 4 short cards: **Non-profit Swiss Verein** ·
  **One member, one vote** · **Authors & operates the frameworks** ·
  **Sole securer of the network (every member runs a validator)**.
- **The seat board** *(signature element — see §1)* — *seats filled of 25* plus
  the sector and region spread; a link to `/join` to start a candidacy.
- **Latest record** — the 3 most recent `/news` entries (auto-generated).
- **Provisional-governance note** — one line: pre-mainnet admissions are decided
  through this site's provisional voting mechanism; at mainnet launch all
  Council voting moves on-chain. Links to `/about`.
- **Apply CTA** — closing banner → `/join`.

### 4.2 About `/about`

Who the Council is and how it runs.

- **Mission** — 2–3 sentences from the entity definition: the non-profit
  governance body of Verana's open public trust layer; authors and operates the
  governance frameworks; the sole body that governs and secures the live
  network; structurally uncapturable.
- **Structure** — non-profit Swiss Verein (Art. 60 ZGB), in formation, target
  incorporation Q4 2026. The three organs, one line each:
  - **General Assembly** — the supreme organ; all seated Founding Members, one
    vote each; Observers attend and speak, no vote.
  - **Board** — small, GA-elected, fixed staggered terms; runs and legally
    represents the association; **zero network authority** (a capture-resistance
    feature).
  - **Committees** — e.g. Membership & Seats; Technical / Validator.
  - Link to Bylaws in `verana-council-gov`.
- **Two governance layers, one membership** — short two-column block:
  *association governance* (the Verein: statutes, budget, admissions — GA +
  Board under Swiss law) vs. *network governance* (the protocol: frameworks and
  parameters — on-chain via validator nodes after mainnet; provisional
  mechanism before). The statutes make the association recognize on-chain
  outcomes.
- **How we operate** — bullets: one-member-one-vote; seat-diversity rule (broad
  spread across sectors and regions, capped at 25 members); ⅔ supermajority for
  any protocol-governance change; fixed validator terms with formal renewal;
  membership is free, with member liability excluded by statute.
- **Funding** — one short paragraph: free membership; costs covered by 2060 OÜ
  (steward) before network launch; after launch the network funds its own
  governance via a protocol-defined on-chain allocation. The Council does not
  issue or own VNA.
- **Status & stewardship** — in formation; 2060 OÜ is steward pre-incorporation;
  pre-incorporation seatings are ratified en bloc at the constitutive General
  Assembly.
- **What the Council is not** — short bullets, verbatim from the hard limits:
  not a standards body (→ Foundation), not a product vendor, not a sector-EGF
  authority, not a grant-making body, not the issuer or owner of the VNA token,
  not single-company controlled.

### 4.3 Governance `/governance`

A single summary page. **No normative text on-site** — every item links to
`github.com/verana-labs/verana-council-gov`.

- **Network GF** — the constitutional layer every EGF on Verana must respect.
  1 sentence + link.
- **ECS-EGF** — the Council's ecosystem framework covering the five Essential
  Credential Schemas. Includes the five-schema table:

  | Schema | Identifies | Issuer onboarding mode | Definition |
  | --- | --- | --- | --- |
  | `Service` | Verifiable Services (incl. AI agents) | `ECOSYSTEM_ONBOARDING_PROCESS` | service.json |
  | `Organization` | Legal entities controlling services | `GRANTOR_ONBOARDING_PROCESS` | org.json |
  | `Persona` | Individuals controlling services | `GRANTOR_ONBOARDING_PROCESS` | persona.json |
  | `UserAgent` | End-user wallets and applications | `OPEN` | ua.json |
  | `Badge` | Humans (e.g. employees) behind a Verifiable Service | `OPEN` | badge.json |

  Schema links → `verana-labs.github.io/verifiable-trust-spec/schemas/v4/*.json`.
  The `OPEN` issuer mode of `Badge` is fixed by the Verifiable Trust spec
  ([VT-ECS-JSON-SCHEMA-VPR-CONFIG]); the other issuer onboarding modes are
  ECS-EGF choices.
- **ECS Ecosystem Participants** *(forward note + waitlist)* — ECS Ecosystem
  Participants are required for running Verifiable Services on Verana. Their
  selection is a **separate process, governed by the ECS-EGF**: recruitment
  opens as soon as the Council delivers the framework (target Q4 2026), with
  initial participants permissioned in time for mainnet. Until then the Council
  collects **non-binding expressions of interest** — link to the EOI form
  (§6.2).
- **Template EGF** — "a scaffold, not a gate" for ecosystems authoring their own
  sector EGF. 1 sentence + link.
- **Bylaws & Code of Conduct** — one line each + links to the gov repo.
- **Risk management & disputes** — one short paragraph: graduated sanctions,
  public record, appeal to the General Assembly.

### 4.4 Members `/members`

- **The seat board** — the full version (same component as Home): *seats filled
  of 25*, the sector spread, and the region spread. Anonymous — no org names.
- **How seats work** — one paragraph: a candidate applies under one sector and
  declares a region; admission by ⅔ of seated members, one ballot per candidate,
  never head-to-head; up to 25 seats; the Membership & Seats Committee keeps a
  broad sector/region spread (region is a soft guardrail, not a fixed quota).
  Fixed validator terms with formal renewal.
- **Members & Observers** — the directory: seated Founding Members and
  Public-Sector Observers, with org name, sector + region, and date seated
  (logo grid; placeholders pre-incorporation). Listing is admin-curated.
- **Become a Member** — link to `/join`.

### 4.5 News `/news`

**The public record**, reverse-chronological, machine-generated by console
actions and steward acts: candidacy opened · admission vote opened · vote result
(accepted / refused) · member seated · observer accepted · seed-cohort
designation (with published rationale) · published meeting minutes · framework
releases · incorporation milestones. One line per entry, dated, with links to
the underlying artifact (gov-repo commit, minutes file). No editorial posts.

---

## 5. Persistent CTA — Join `/join`

The candidacy page. Reachable from the nav button, the seat board, and the
closing banner.

- **Intro** — one short paragraph: two tracks; **membership is free** (no dues,
  no capital contribution); recruitment open through Q4 2026. One clarity line:
  Founding Member = Verein member = GA voter = validator operator — one status.
  Seated members also receive a complimentary Verana Foundation Associate
  Membership (dues waived).
- **Two tracks**, one card each:
  - **Founding Member** (voting) — governments, standards bodies, enterprises,
    academic institutions. Co-authors the frameworks through the formation
    period; **should run a validator node on the Verana testnet during the
    formation period** (the readiness step for the genesis validator set), and
    **operates a mainnet validator node from launch** (mandatory — it is how
    voting is exercised on-chain). Admission by ⅔ vote of seated members.
  - **Public-Sector Observer** (non-voting) — sovereigns and multilateral bodies
    that cannot join a Swiss Verein under procurement / sovereign-immunity
    rules. Contractual participation: attendance and voice, no vote. Accepted by
    steward decision pre-incorporation, by the Board thereafter. Convertible to
    membership.
- **How admission works** *(Founding Member track — short numbered list, public
  and honest)*:
  1. **Apply** — sign in (passwordless: Google, GitHub, or email code), pick the
     sector and region that fit the organization, and submit a **non-binding
     expression of interest** (no document signed — any authorized rep can do
     this without legal review). The binding Council Membership Agreement comes
     later (step 4).
  2. **Vetting** — the Membership & Seats Committee (the steward,
     pre-incorporation) runs due diligence. No Foundation membership or any
     other third-party status is required.
  3. **Ballot** — one vote per candidate, accept / refuse, **⅔ supermajority of
     seated members**, in an async **14-day window**. Admissions stop at the
     **25-seat cap**.
  4. **Seated & bound** — the organization is named on the public record only
     once accepted/seated; then the binding **Council Membership Agreement** is
     executed from the console (legal-reviewed, authorized signatory). A refused
     candidate may re-apply under another sector/region.
  - One transparency line on bootstrap: the first 3 members (2060 plus the
    first 2 vetted candidates) are designated by the steward with published
    rationale; from candidate #4 onward every admission goes through the peer
    vote. All pre-incorporation seatings are ratified at the constitutive
    General Assembly.
  - One provisionality line: this admission mechanism is provisional and
    sunsets at mainnet launch, when all Council voting moves on-chain.
- **Apply** — the signed-in flow (§6.1); pre-incorporation submissions are
  confidential.
- **Contact** — at the bottom: "Questions? Use the [contact form](/contact)
  (inquiry type *Council membership*)." No email address published.

---

## 6. Console & forms (signed in)

The **Council console** (`/account`) is what makes this site the point of
contact and point of action. Reuse the veranafoundation.org-website platform
wholesale: passwordless auth, e-signature, per-organization access lists,
calendar-synced meetings, published minutes. Council-specific surfaces:

### 6.1 Candidacy & seat (Founding Member track)

- Apply: pick a **sector** + **region** → submit a **non-binding expression of
  interest** (no document signed; a representation that the submitter is
  authorized) → awaiting vetting.
- Track status: vetting → ballot open (deadline visible) → result. Refused:
  one-click re-apply under another sector/region.
- After seating: execute the binding **Council Membership Agreement** from the
  console — reviewed by the org's legal team, e-signed by an authorized
  signatory (the agreement is to be drafted; replaces the abandoned
  Initial-Council-Member-MoU v1).
- After seating: seat record — sector + region, date seated, validator term and
  renewal date (term mechanics activate at mainnet), and **testnet validator
  status** — seated members are expected to bring a testnet node online during
  the formation period as the readiness step for the genesis validator set.

### 6.2 ECS Participant expression of interest

A minimal, non-binding waitlist form (org, sector, intended ECS role, contact).
No agreement, no commitment; the formal process opens once the ECS-EGF is
delivered. Stored in the same intake pipeline; listed in the console.

### 6.3 Organization

Self-service representatives & access list (admins / representatives), managed
by the org itself; designate the **voting representative**.

### 6.4 Meetings

General Assembly and committee schedules synced to Google Calendar (Foundation
platform pattern: role-account organizer, native invitations, auto Meet links,
single-occurrence reschedules). Attendance and Markdown minutes recorded
per-session, then published to `verana-council-gov` as the immutable record —
which feeds `/news`.

### 6.5 Admission votes (provisional — the mechanism's entire scope)

Visible to seated voting members only: ballot list (one per candidate),
accept / refuse, quorum (⅔ of seated members) and 14-day deadline shown;
results signed into the public record. **Sunsets at mainnet launch** — replaced
by on-chain governance. No general-purpose proposal/voting system is built.

### 6.6 Anti-abuse & intake (shared mechanics)

Same posture as the Foundation site: internally-routed forms only, no published
email endpoints anywhere; server-side honeypot + time-to-submit +
per-IP rate limiting + disposable-email blocklist; **no** third-party captcha.
Pre-incorporation submissions confidential.

---

## 7. Contact `/contact`

Footer-linked utility page. **Keep the existing internally-routed form** (already
built: form + Relaticle CRM routing) and align copy with the Foundation site's
posture: no email address published anywhere on the site.

- **Inquiry types** *(routes the message)* — `Council membership — Founding
  Member` · `Council membership — Observer` · `ECS participant — expression of
  interest` · `Governance / frameworks` · `Press or analyst` · `General inquiry`.
- Fields, consent checkbox, honeypot, and aside ("why this form") mirror the
  Foundation spec §6.
- **Office & legal** — entity block: **Verana Council Association (in
  formation)**, represented by **2060 OÜ**, Ahtri tn 12, 10151 Tallinn, Estonia
  (registry 16853041), acting as steward pre-incorporation. The Verein's seat
  and canton are `[TBD on incorporation]`.

## 8. Privacy `/privacy`

Mirrors the Foundation site's privacy policy in structure and posture (GDPR, no
data sale, no ad targeting, consent-gated analytics, self-hosted anti-abuse).
Adapt the controller: **Verana Council Association (in formation)**, represented
by 2060 OÜ as steward until incorporation; thereafter the incorporated Verein
(then add Swiss FADP alongside GDPR, supervisory authority Swiss FDPIC).
Additional data category vs. the Foundation: candidacy and ballot records — note
that vote outcomes and seatings are published as the public record by design;
personal data of representatives is not.

## 9. Legal & licensing

- **Entity:** Verana Council Association, non-profit Swiss Verein (Art. 60
  ZGB), **in formation**; target incorporation Q4 2026; stewarded by 2060 OÜ
  pre-incorporation. Seat: `[SEAT_CITY]`, `[CANTON]` — placeholders until fixed.
- **No securities framing.** VNA appears only in the hard-limits context (the
  Council does not issue or own it). No tokenomics, price, returns, or offering
  language anywhere.
- **Footer legal links:** Privacy (`/privacy`) · Terms · Cookies.
- **Content license:** site text CC-BY-SA 4.0; brand assets CC-BY 4.0.

## 10. Out of scope (explicitly dropped)

- **A general-purpose proposal/voting system** — the provisional mechanism does
  admissions only, then sunsets; everything else waits for on-chain governance.
- **The ECS Participant selection process** — deferred until the ECS-EGF exists;
  only the EOI waitlist ships now.
- **Specs/software stewardship, token, grants, working groups** → `veranafoundation.org`.
- **Build tutorials, API docs** → `verana.io` / `docs.verana.io`.
- **Product marketing** → `hologram.zone` / `2060.io`.
- **Normative governance text on-site** → `verana-council-gov` repo.
- **Editorial blog** — `/news` is a generated record, not a publication.
- **Deep sub-page trees** (about/*, governance/*, meetings/*, press/*, join/*).

## 11. Page map (summary)

| Path | Nav | Purpose |
| --- | --- | --- |
| `/` | — | Hero · what the Council is · live seat board · latest record · provisional-governance note · Apply CTA |
| `/about` | About | Mission · organs · two governance layers · how we operate · funding · status · what it is not |
| `/governance` | Governance | Network GF · ECS-EGF (+ schema table, ECS-participant forward note) · Template EGF · bylaws & CoC · disputes — all linking to the gov repo |
| `/members` | Members | Seat board (filled/cap + sector & region spread) · how seats work · member/observer directory |
| `/news` | News | The generated public record |
| `/join` | **Apply** (button) | Two tracks · how admission works · apply (signed-in candidacy flow) |
| `/account` | Sign in | Council console: candidacy & seat · org access lists · meetings · admission ballots (provisional) · ECS EOI |
| `/contact` | (footer) | Internally-routed form (existing, re-typed) · office & legal |
| `/privacy` | (footer) | GDPR (+FADP on incorporation) privacy policy |
