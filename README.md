# Revamp-Info

Internal communication and dashboard site for Revamp-IT team.

## What This Is

A static site for sharing interactive information with the team:
- Fundraising research (Stiftungen, deadlines, contacts)
- Financial dashboards
- KPIs and impact metrics
- Strategy and operations docs

**Not PDFs. Not emails. Clickable, navigable, always up-to-date.**

## Structure

```
/                   → Main dashboard
/pages/finanzen     → Financial overview
/pages/fundraising  → Fundraising hub
  └── stiftungen    → Foundation research
/pages/kennzahlen   → KPIs
/pages/wirkung      → Impact metrics
/pages/strategie    → Strategy docs
/pages/team         → Team info
```

## Deployment

Hosted on Vercel at: `revamp-info.vercel.app`

Push to `main` branch → automatically deploys.

## Local Development

Just open `index.html` in a browser, or:

```bash
npx serve .
```

## Related

- **revampit.vercel.app** - Public website + admin
- **revampit.vercel.app/admin/hirn** - AI assistant
- **This site** - Internal dashboards and research
