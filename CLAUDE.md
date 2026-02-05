# Revamp-Info - Internal Communication Site

@~/.claude/CLAUDE.md

---

## Overview

Revamp-Info is the **internal communication and dashboard site** for Revamp-IT. It provides interactive, navigable content for the team - replacing PDFs, emails, and static documents with a living website.

**Live URL:** https://revamp-info.vercel.app
**Repository:** https://github.com/g-but/revamp-info (private)

---

## First Principles

### Purpose

**Goal:** Enable team communication through interactive web content instead of static documents.

**Constraints:**
- Must be simple (static HTML/CSS/JS - no build step)
- Must be fast (no heavy frameworks)
- Must be maintainable by non-developers (edit HTML directly)
- Must work offline (no external API dependencies)

**Invariants:**
- Content is internal but not secret (no password protection currently)
- Single source of truth - data comes from CSVs in Nextcloud, rendered here
- Swiss German standards (ss not ß, umlauts OK)

### What This Is NOT

| This IS | This is NOT |
|---------|-------------|
| Internal dashboards | Public marketing |
| Team research & reference | User-facing features |
| Static content | Dynamic app with database |
| Communication tool | AI assistant (that's Hirn) |

---

## SSOT (Single Source of Truth)

### Data Sources

| Data Type | SSOT Location | This Site |
|-----------|---------------|-----------|
| Financial data | Nextcloud CSVs (`Finanzmodell/`) | Renders & visualizes |
| Foundation research | This site (`stiftungen.html`) | IS the SSOT |
| KPIs | Nextcloud CSVs (`KPI_Framework/`) | Renders & visualizes |
| Team info | Nextcloud (`Personal_und_HR/`) | Renders & links |

### Rules

1. **Never duplicate data** - If it exists in Nextcloud, reference it, don't copy it
2. **Research pages ARE the SSOT** - Pages like `stiftungen.html` contain original research that doesn't exist elsewhere
3. **Update in one place** - If data changes, update the source (CSV or this page), not both
4. **Cite sources** - Every data point should link to where it came from

### DRY in Static HTML

We use JavaScript components to avoid duplication:

```
Navigation → assets/js/components/nav.js (SSOT)
Footer     → assets/js/components/footer.js (SSOT)
Common CSS → assets/css/styles.css (SSOT)
```

**How to use in a page:**
```html
<!-- Instead of copy-pasting nav HTML -->
<div id="nav-placeholder"></div>
<script src="../../assets/js/components/nav.js"></script>

<!-- Instead of copy-pasting footer HTML -->
<div id="footer-placeholder"></div>
<script src="../../assets/js/components/footer.js"></script>
```

**Template page:** See `pages/fundraising/stiftungen.html`

---

## Architecture

### Tech Stack

```
Static Site (No Build Step)
├── HTML5          → Structure
├── CSS3           → Styling (single stylesheet)
├── Vanilla JS     → Interactivity (minimal)
└── Vercel         → Hosting (auto-deploy from git)
```

**No frameworks. No npm. No build process.**

Edit HTML → Push to git → Live in seconds.

### File Structure

```
revamp-info/
├── CLAUDE.md              # THIS FILE
├── README.md              # Project overview
├── vercel.json            # Deployment config
├── index.html             # Main dashboard
├── assets/
│   ├── css/
│   │   └── styles.css     # Global styles (SSOT for common CSS)
│   └── js/
│       ├── components/    # Reusable JS components (SSOT)
│       │   ├── nav.js     # Navigation - edit here, updates everywhere
│       │   └── footer.js  # Footer - edit here, updates everywhere
│       ├── data-loader.js # CSV loading utilities
│       └── utils.js       # Formatting helpers
└── pages/
    ├── finanzen/          # Financial dashboards
    ├── fundraising/       # Grant research
    │   ├── index.html     # Fundraising overview
    │   └── stiftungen.html # Foundation details
    ├── kennzahlen/        # KPIs
    ├── wirkung/           # Impact metrics
    ├── strategie/         # Strategy docs
    ├── team/              # Team info
    ├── operations/        # Operations
    ├── marketing/         # Marketing
    ├── methodik/          # Methodology
    ├── preismodell/       # Pricing model
    ├── transparenz/       # Transparency
    └── dokumente/         # Documents
```

### Data Flow

```
Nextcloud (SSOT)                    Revamp-Info (Presentation)
─────────────────                   ─────────────────────────
CSV files                    →      Dashboards load & display
Markdown docs                →      Research pages reference

Team edits CSVs              →      Site reflects latest data
```

**Note:** Some pages embed data directly (like stiftungen.html). For frequently changing data, use the data-loader.js to fetch CSVs.

---

## Content Guidelines

### Page Structure

Every page should have:

```html
<!DOCTYPE html>
<html lang="de-CH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Page Title] - Revamp-Info</title>
    <!-- Inline critical CSS or link to styles.css -->
</head>
<body>
    <nav><!-- Navigation back to main sections --></nav>
    <main>
        <h1>[Page Title]</h1>
        <!-- Content -->
    </main>
    <footer>
        <p>Letzte Aktualisierung: [Date]</p>
    </footer>
</body>
</html>
```

### Writing Style

| Do | Don't |
|----|-------|
| Schweizer Hochdeutsch (ss, not ß) | German ß |
| Direct, actionable language | Vague descriptions |
| Link to sources | Make claims without evidence |
| Include "last updated" dates | Leave content undated |
| Use tables for comparisons | Long prose paragraphs |

### Visual Hierarchy

```
H1 → Page title (one per page)
H2 → Major sections
H3 → Subsections
H4 → Detail headers (sparingly)

Tables → For data, comparisons
Lists  → For steps, options
Cards  → For grouped info blocks
```

### Status Indicators

Use consistent status badges:

```html
<span class="status status-open">Offen</span>
<span class="status status-closed">Geschlossen</span>
<span class="status status-soon">Bald</span>
<span class="status status-rolling">Laufend</span>
```

---

## Development Workflow

### Local Development

```bash
# Option 1: Just open in browser
open index.html

# Option 2: Local server (for JS module loading)
npx serve .
# Then visit http://localhost:3000
```

### Making Changes

```bash
# 1. Edit files
code pages/fundraising/stiftungen.html

# 2. Test locally
open pages/fundraising/stiftungen.html

# 3. Commit and push
git add -A
git commit -m "Update Stiftungen deadlines"
git push

# 4. Vercel auto-deploys (live in ~10 seconds)
```

### Adding a New Page

1. Create folder: `pages/[section-name]/`
2. Create file: `pages/[section-name]/index.html`
3. Use this template structure:

```html
<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="last-updated" content="[DATE]">
  <title>[Title] – Revamp-Info</title>
  <link rel="stylesheet" href="../../assets/css/styles.css">
  <style>
    /* Page-specific styles only */
  </style>
</head>
<body>
  <div class="page-wrapper">
    <!-- Nav component (SSOT) -->
    <div id="nav-placeholder"></div>
    <script src="../../assets/js/components/nav.js"></script>

    <main class="page-content">
      <h1>[Page Title]</h1>
      <!-- Content -->
    </main>

    <!-- Footer component (SSOT) -->
    <div id="footer-placeholder"></div>
    <script src="../../assets/js/components/footer.js"></script>
  </div>
</body>
</html>
```

4. To add nav link: edit `assets/js/components/nav.js` (ONE place)
5. Update main dashboard if needed

### Migrating Existing Pages

13 pages still use copy-pasted nav/footer. To migrate:
1. Replace `<nav>...</nav>` with placeholder + script (see template above)
2. Replace `<footer>...</footer>` with placeholder + script
3. Add `<meta name="last-updated">` tag
4. Test and commit

---

## Relationship to Other Systems

```
┌─────────────────────────────────────────────────────────────┐
│                     REVAMP-IT ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Nextcloud (Revamp-Hirn)     revamp-info.vercel.app         │
│  ────────────────────────    ─────────────────────────      │
│  • Source CSVs               • Renders data visually         │
│  • Markdown docs             • Interactive navigation        │
│  • Team file access          • Shareable URLs                │
│                                                              │
│  revampit.vercel.app         revampit.vercel.app/admin      │
│  ────────────────────        ────────────────────────       │
│  • Public website            • Platform management           │
│  • Shop, services            • Products, users, content      │
│  • User-facing               • Staff-only                    │
│                                                              │
│  revampit.vercel.app/admin/hirn                             │
│  ──────────────────────────────                             │
│  • AI assistant                                              │
│  • Helps navigate/use platform                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Quality Checklist

Before pushing changes:

- [ ] Page loads without errors (check browser console)
- [ ] All links work (no broken hrefs)
- [ ] Mobile-responsive (test at 375px width)
- [ ] "Last updated" date is current
- [ ] Swiss German spelling (ss not ß)
- [ ] Sources cited for data/claims
- [ ] Navigation back to parent sections works

---

## Common Tasks

### Update Foundation Deadlines

1. Edit `/pages/fundraising/stiftungen.html`
2. Find the foundation section
3. Update deadline, status badge, and "Quelle" link
4. Update "Stand" date at top of page
5. Commit and push

### Add New Dashboard Section

1. Create folder in `/pages/`
2. Create `index.html` with standard structure
3. Add card/link on main `index.html`
4. Add to navigation if appropriate

### Pull Latest Data from Nextcloud

Currently manual - copy updated content. Future: automate CSV fetching.

---

## Don't

- Add npm/node dependencies (keep it simple)
- Use frameworks (React, Vue, etc.)
- Hardcode data that changes frequently (use data-loader)
- Forget to update "last updated" dates
- Use ß in German text (use ss)
- Commit without testing locally first
- Create pages without navigation links

---

**Last Updated:** 2026-02-05
**Maintainer:** Revamp-IT Team
