# Platform Replatform Plan ("Hirnli" — working candidate name)

**Status:** Proposed 2026-07-17, revised same day after George's scope clarification.
**Direction:** The platform and the tenant are separate identities. Revamp-IT is an
organization that serves as the proof of concept — not the brand of the platform.
The whole product must be trilingual (DE/FR/EN) with a language switch as elegant as
the theme toggle, and the single-tenant chrome must give way to a real platform
architecture. Mobile-first is paramount on every surface.

**Naming:** The product name is NOT decided ("Hirnli" is a candidate). Therefore the
brand is a config value, not a constant sprinkled through code:
`src/lib/config/platform-brand.ts` (PLATFORM_BRAND) is the ONLY place the platform's
name/tagline exist — implemented 2026-07-17. Renaming the platform = editing that one
file. Tenant identity (ORG_PROFILE) and platform identity are now fully separated
(the tenant's instance URL is `ORG_PROFILE.siteUrl`; the platform never borrows the
tenant's name and vice versa). Everywhere this doc says "Hirnli", read
"PLATFORM_BRAND.name".

**Scope — stage 1 (now):** Fundraising for Revamp-IT via donations/foundation grants.
100% focus on making it perfect for tenant #1, while every architectural choice keeps
the register/tenant separation clean so opening registration to other organizations
later requires no rework.

**Long-term vision (explicit NON-goal for now):** the platform eventually aids any
form of financing — donations, lending, investment — analytics- and modeling-first
(adjacent to OrangeCat's thesis). We do NOT build for this today (YAGNI); we only
avoid architectural decisions that would preclude it. Concretely that costs us
nothing: the register/analysis split, org-scoped data, and config-driven scoring are
the same foundations either way.

---

## 1. What we are actually building

Today one Next.js app conflates **three different products**:

| Surface | What it is | Audience | Today |
|---|---|---|---|
| **A. Platform marketing** | What Hirnli is, roadmap, pricing | Advisors, investors, future tenants | `/plattform`, `/en/platform` (branded Revamp-Info) |
| **B. Platform app** | Foundation registry, fit scoring, Gesuch workflow, pipeline | Org teams doing fundraising | `/fundraising/**` (Revamp-IT chrome, German only) |
| **C. Tenant showcase** | An org's public transparency hub (Finanzen, Wirkung, Team…) | Foundation officers evaluating *that org* | `/`, `/finanzen`, `/wirkung`… (this IS Revamp-IT content) |

The replatform = giving each surface its own identity and chrome while keeping **one
codebase, one deployment, one DB**. Surface C is itself a product feature: "transparency
hub as a service" — every future tenant gets what Revamp-IT has today.

## 2. Brand & domain architecture

Per the standing build strategy (free subdomains under orangecat.ch first, promote when
proven):

```
hirnli.orangecat.ch          → Surface A (Hirnli marketing, trilingual)
                               + later Surface B under /app
revamp-info.orangecat.ch     → Surface C for tenant revamp-it (unchanged URLs, no SEO loss)
<org>.hirnli.ch (future)     → Surface C per tenant, once hirnli.ch is secured
```

One Next.js app serves all hosts. Caddy already terminates TLS and proxies both domains
to port 4012; Next middleware reads the `Host` header and rewrites into route groups:

```
src/app/
├── (hirnli)/        # Surface A+B — platform chrome, Hirnli brand
│   ├── page.tsx     # marketing home (what /en/platform is today, ×3 locales)
│   ├── roadmap/ …
│   └── app/         # Surface B — the tool (moves from /fundraising/** over time)
└── (tenant)/        # Surface C — org chrome, org branding from DB
    ├── page.tsx     # org dashboard (today's homepage)
    ├── finanzen/ …
```

**Why not a separate repo/app:** shared schema, shared domain logic, one deploy, and the
tenant showcase consumes the same data the app manages. Split later only if team size
demands it.

## 3. System design — de-single-tenanting

### 3.1 Tenant resolution layer (the keystone)

Replace the compile-time constant with request-scoped resolution. 81 files import
`ORG_PROFILE` today; they will import a resolver instead:

```ts
// lib/tenant/resolve.ts
getTenant(): Promise<Tenant>        // server: from Host header (middleware sets x-org-id)
useTenant(): Tenant                 // client: from TenantProvider context
```

Phase 0 ships with a single hardcoded mapping (`revamp-info.orangecat.ch → revamp-it`)
so behavior is identical — but the coupling is broken. The mechanical migration
(81 files) is regex-friendly and low-risk because `ORG_PROFILE`'s shape becomes the
`Tenant` type.

### 3.2 Org content moves from TS modules to the DB

The 12+ ORG-SPECIFIC config files (stories, numbers, schwerpunkte, budget-scenarios,
value-cascade, gesuch-templates, team, theme taxonomy) become **rows, not code**:

```
org_profiles      (org_id PK, identity, branding tokens, locales, domains)
org_content       (org_id, key, locale, value JSONB, version, updated_at)
org_scoring       (org_id, scoring engine config JSONB — the engine is already data-shaped)
```

- Zod schemas stay the SSOT for shape validation (they already exist per config file).
- Seed script converts today's TS configs into revamp-it rows — content is preserved 1:1.
- The compile-time `ThemeId` enum becomes org taxonomy data (the scoring engine config
  in `fit-scoring.ts` is already declarative; it just needs to load per-org).
- Editing UI comes later; until then content is edited via seed files + re-seed (same
  developer workflow as today, no regression).

### 3.3 Kill the 3.5 MB generated cache

`stiftungen-generated.ts` is org-blind and the single biggest blocker to runtime
tenancy. Replace with server-side queries:

- Registry reads: direct DB via Drizzle with `unstable_cache`/`revalidateTag` (registry
  changes are batch events — cache aggressively, invalidate on sync).
- Org analysis reads: query scoped by `org_id` (columns + indexes already exist on all
  5 tables since migration 0006).
- Consequence: `npm run sync` and `SKIP_SYNC` disappear; SSG pages become ISR or
  dynamic; build no longer needs DB access; repo loses the 3.5 MB commit churn.

### 3.4 Auth (replaces basic-auth/`INTERNAL_AUTH=off`)

Self-hosted **Auth.js (or Better Auth)** on the box — no SaaS dependency, consistent
with the sovereign-infra direction. Model:

```
users (platform-level) ←→ org_memberships (user, org, role: owner|editor|viewer)
platform_admins
```

- Surface B requires a session + org membership; Surface C is public by design;
  Surface A public.
- Tenant showcase publishing controls (which pages are public) become org settings.
- The current `INTERNAL_AUTH=off` demo mode maps to "revamp-it showcase fully public" —
  preserved as a per-org setting, not a global env hack.

## 4. i18n — DE / FR / EN across the whole product

### 4.1 Infrastructure: `next-intl`

The typed-dictionary pattern we started (platform-content.ts) is right for rich page
content but doesn't scale to 28 routes of chrome. Adopt **next-intl** (App Router
native): locale routing, message catalogs, number/date formatting (CHF, Swiss formats),
and type-safe message keys.

- **URL strategy:** prefix on all surfaces — `/de/…`, `/fr/…`, `/en/…`.
  Default-locale negotiation: cookie → `Accept-Language` → surface default
  (tenant sites: org's default locale, revamp-it = de; Hirnli marketing: en).
  Legacy unprefixed URLs 308-redirect to the negotiated locale (SEO preserved via
  `hreflang` alternates).
- **Message catalogs:** `messages/{de,fr,en}.json`, split by namespace (chrome, app,
  marketing). CI check: catalogs must have identical key sets (a missing FR key fails
  the build — same guarantee our typed dictionary gives, at scale).

### 4.2 The four content tiers (each localizes differently)

| Tier | Examples | Mechanism |
|---|---|---|
| 1. UI chrome | nav labels, buttons, empty states, form labels | next-intl catalogs — translate once, ~small volume |
| 2. Platform content | Hirnli marketing, roadmap | typed per-locale content modules (existing pattern) or catalogs |
| 3. Org content | stories, methodology prose, team bios | `org_content` rows keyed `(org_id, key, locale)` with fallback chain `requested → org default → de` and a visible "nur auf Deutsch verfügbar" affordance until translated |
| 4. Registry data | foundation purpose texts | stay in source language (they are legal register text); UI labels around them localize |

### 4.3 Gesuch language is a PRODUCT feature, not UI i18n

~a fifth of Swiss grant-making foundations are francophone. The Gesuch generator gaining
`documentLocale` (de/fr) per foundation — cover letter, PDF templates, story blocks in
the foundation's language — is a Phase D feature with direct win-rate impact. Keep it
out of the chrome-i18n scope but on the roadmap explicitly.

### 4.4 Translation workflow

DE is the source of truth. EN and FR drafts are LLM-generated **but gated by human
review before deploy** (same discipline as foundation data: nothing unverified ships).
FR needs a native-quality reviewer — Romandie foundation officers will read it.

## 5. UI/UX design

### 5.1 Language switch — spec

Same interaction weight as the theme toggle, sitting next to it in the nav:

- **Desktop:** an icon button (globe) → popover with three rows `Deutsch / Français /
  English`, current locale checked. One click, popover closes, URL swaps prefix,
  cookie persists. No layout shift (button is fixed-width like ThemeToggle).
- **Mobile:** same control inside the nav drawer as a segmented `DE | FR | EN` row —
  thumb-reachable, 44px targets.
- Locale persists across navigation and sessions (cookie), and the switcher always
  links to the *same page* in the other locale (via next-intl's `Link`).

### 5.2 Two chromes

- **Hirnli chrome** (Surfaces A+B): Hirnli wordmark, product nav (Stiftungen, Gesuche,
  Pipeline, Methodik), org switcher (Phase D), user menu, theme + language toggles.
  Needs a minimal brand: wordmark + one accent; start with a text wordmark, don't block
  on logo design.
- **Tenant chrome** (Surface C): org logo, org nav, org accent color — driven by
  `org_profiles.branding` injected as CSS custom properties in the tenant layout.
  **The design-token discipline pays off here:** components are already zero-hex and
  consume semantic tokens, so per-tenant theming = setting `--color-primary` etc. at
  the layout root. Footer: "Powered by Hirnli" (platform's growth loop).
- Mobile-first acceptance bar for every changed screen: verified at 375×667, no
  horizontal scroll, 44px targets, stacked CTAs.

### 5.3 Naming surfaces

Hirnli appears as: marketing brand, app chrome, "Powered by Hirnli" on tenant sites,
OG images for platform pages. Revamp-IT branding remains exclusive on its showcase
pages and inside its Gesuch documents (foundations fund Revamp-IT, not Hirnli).

## 6. Phasing (no big bang; every phase ships)

> **STATUS 2026-09-03 — the order below was overtaken by events; read this first.**
>
> George's direction changed the product: open registration, one account holding
> several organisations, and foundations managing their own profiles. Hirnli is
> the platform and evig is a CUSTOMER of it — the first of many, alongside
> Revamp-IT. That reframes this from "de-single-tenant one app" to "build a
> two-sided platform", and made identity urgent rather than Phase C work.
>
> **Shipped, out of order:**
> - *A.2* — `hirnli.orangecat.ch` in Caddy + host-routing middleware. Note the
>   middleware REDIRECTS `/` rather than rewriting: `nextUrl` carries the public
>   origin while the server listens on `localhost:4012`, so a rewrite becomes a
>   cross-origin proxy and 500s behind Caddy. See `src/middleware.ts`.
> - *A.1* — platform name decided: **Hirnli**. One line in `platform-brand.ts`.
> - *Identity* (was C.3) — Better Auth + organisation plugin, `/o/<slug>/`
>   routing, org switcher, open registration. revamp-it and evig seeded as
>   organisations. Authorisation reads the org from the URL and re-checks a
>   membership row; `session.activeOrganizationId` is deliberately NOT trusted,
>   because one cookie is shared by every tab. See `src/lib/auth/access.ts`.
>
> **Also done, and a precondition nobody had written down:** Hirnli now has its
> OWN Postgres database. Its nine tables lived in evig's `revampit` DB, where
> `users`/`accounts`/`sessions` already exist and belong to evig's marketplace —
> so `users` could not be created at all, and an auth library aimed at the wrong
> one authenticates real people against the wrong application. Moved 2026-09-02,
> row-for-row verified, originals left in place as a fallback (drop after a
> soak). `apps.conf`'s `db` column decides which database the DEPLOY migrates —
> changing `DATABASE_URL` alone moves the app but not its migrations.
>
> **Superseded:** §3's data model. The foundations table fuses register facts,
> foundation-authored terms and one org's private judgement into a single
> `config_data` blob, and `fitScore` is fit against ONE org's mission — so the
> model is single-tenant by construction, not configuration. The three-layer
> split replacing it, and why the previous attempt at it (migrations 0000→0002
> →0003) was rolled back, are set out in the 2026-09-02 architecture proposal.
>
> **Still true and still next:** B.1's 80-file `ORG_PROFILE` migration, and
> making `getTenant()` DB-backed so adding an organisation needs no code change.
> evig has an `org_profiles` row but no static profile — deliberately, since
> hardcoding a second tenant re-creates the coupling that phase removes.

**Phase A — Brand + language shell** (~2–4 focused days)
1. Update CLAUDE.md naming section: name undecided, PLATFORM_BRAND is the SSOT and sole rename point; codename-secrecy rule replaced by "working title until decided".
2. Register `hirnli.orangecat.ch` in Caddy → same app; host-routing middleware.
3. next-intl scaffold; locale-prefix routing with redirects; language switcher in nav
   (elegant, paired with theme toggle).
4. Tier-1 chrome catalogs DE/EN/FR + platform marketing pages rebranded **Hirnli**
   and translated ×3 (FR reviewed by a human before deploy).
5. Tenant content pages: DE everywhere, EN/FR show DE content with a graceful notice —
   honest, not broken.
   *Exit criteria: hirnli.orangecat.ch live trilingual; language switch on every page;
   nothing regressed on revamp-info.orangecat.ch.*

**Phase B — Tenant resolution** (~1 week)
1. `getTenant()`/`useTenant()`; migrate all 81 `ORG_PROFILE` imports.
2. Split route groups `(hirnli)` / `(tenant)`; two chromes; tenant branding via CSS
   vars from config (still file-seeded).
3. `vercel.json`-era redirects and OG images made host-aware.
   *Exit criteria: same app serves Hirnli chrome on hirnli.* and Revamp-IT chrome on
   revamp-info.*; zero visual regression on tenant site.*

**Phase C — Data de-coupling** (~2–3 weeks, the heavy lift)
1. `org_profiles` / `org_content` / `org_scoring` tables + seed from TS configs.
2. Replace generated-cache reads with cached DB queries; delete sync pipeline.
3. Auth.js self-hosted; org memberships; per-org publishing settings replace
   `INTERNAL_AUTH=off`.
   *Exit criteria: adding a test org requires zero code changes; build needs no DB.*

**Phase D — Second tenant + product i18n depth** (Q4 2026 per roadmap)
1. Onboard org #2 through the seed pipeline; org switcher in app chrome.
2. Tier-3 org-content localization tooling; French Gesuch generation
   (`documentLocale` per foundation).
3. Decide hirnli.ch / trademark; promote domain if PoC metrics support it.

## 7. Open decisions for George

1. **Name decision** — "Hirnli" (Swiss-quirky, "little brain") vs alternatives; when
   decided: domain availability + trademark check, then rename = one edit in
   platform-brand.ts. Until then the working title ships.
2. **FR reviewer** — who does native-quality review of French copy?
3. **Default locale of Hirnli marketing** — proposal: EN default (investors/advisors),
   DE/FR one click away. Tenant sites default to the org's language (revamp-it: DE).
4. **Auth choice** — Auth.js vs Better Auth (both self-hosted; proposal: Better Auth
   for simpler org/roles modeling).
5. **When does `/fundraising/**` move under Hirnli chrome** — Phase B (proposal) or
   only when auth lands in Phase C.

## 8. Risks & mitigations

- **Translation drift** → CI key-set equality check; DE as single source; LLM draft +
  human gate.
- **URL migration/SEO** → 308 redirects + hreflang; tenant domain URLs keep working
  (only gain a locale prefix).
- **Cache removal changes performance profile** → registry queries behind
  `unstable_cache` with tag invalidation; load-test the stiftungen list (1.7k rows is
  trivial for Postgres; the 16k table is indexed).
- **81-file ORG_PROFILE migration** → mechanical, shape-preserving, typecheck-guarded;
  do it in one PR with zero behavior change (Phase B step 1).
- **Scope creep** — every phase ends with a deployed, demonstrable state; Phase A alone
  already delivers George's three explicit asks (Hirnli name, elegant trilingual
  switch, platform-not-tenant framing).
