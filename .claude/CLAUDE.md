# Revamp-Info - Claude Code Instructions

@~/.claude/CLAUDE.md

See `/CLAUDE.md` in project root for full documentation.

## Quick Reference

**What:** Static internal communication site for Revamp-IT team
**Stack:** Pure HTML/CSS/JS (no build step, no frameworks)
**Deploy:** Push to main → Vercel auto-deploys
**URL:** https://revamp-info.vercel.app

## Key Rules

1. **No frameworks** - vanilla HTML/CSS/JS only
2. **No build step** - edit and push, that's it
3. **Swiss German** - use "ss" not "ß", umlauts are OK
4. **Source everything** - cite sources for data/claims
5. **Update dates** - always update "letzte Aktualisierung"

## File Locations

```
/index.html              → Main dashboard
/pages/[section]/        → Section pages
/assets/css/styles.css   → Global styles
/assets/js/              → Utilities (minimal)
```

## Common Commands

```bash
# Local dev
npx serve .

# Deploy
git add -A && git commit -m "message" && git push
```
