# Migrating off `ORG_PROFILE`: which file gets which treatment

`ORG_PROFILE` is a compile-time constant naming one customer. Removing it is
mechanical *only once you know which of three treatments a file needs* — and the
right treatment is **not visible from the file itself**. A component with no
`'use client'` directive is still a client module if a client component imports
it, directly or transitively.

Getting it wrong does not fail at build. `useTenant()` in a server component and
`await getTenant()` in a client one both break at render, in production.

## The three treatments

| Category | Treatment | Why |
|---|---|---|
| **Client components** (`.tsx` reachable from a `'use client'` root) | `useTenant()` from `@/lib/tenant/TenantProvider` | Cannot resolve a tenant themselves — that needs a request header and a DB query. The server resolves once in the tenant layout. |
| **Modules in the client tree** (`lib/domain/*`, `lib/config/*`) | Take the tenant as a **parameter** | Not components, so hooks are invalid. Passing it in is also the correct separation: a composer should not fetch its own context, the same reason `roles.ts` has no imports. |
| **Server components / route handlers** | `await getTenant()` (or `getCurrentOrgId()` when only scoping a query) | They run per request and can await. Use the id alone for a `WHERE` clause — reading a whole profile to build one is a needless round-trip. |

## Every optional field, at every use

`Tenant` makes `address`, `warehouseAddress`, `phone`, `website`, `siteUrl`,
`cloudUrl`, `contactName`, `fundraisingEmail`, `milestones`, `missionAreas`,
`missionSummary` and `missionKeywords` optional, and the second tenant really
does lack most of them. Rendering one unguarded produces a label with nothing
after it — `Laden: Lager:` on a card, `seit undefined` in a stat, a link whose
href is the string "undefined". Omit the line; never invent a value.

**Guard each use, not each file.** This was got wrong once already, in
`strategie/components.tsx`: the Kontakt card guarded its address, the Heute card
two hundred lines up did not, and the page shipped with two empty labels for the
tenant that has no premises. A per-file check would have called that file clean.

It is not enforced by a test. Encoding it needs either JSX-accurate parsing —
which produced four false positives when tried for the query-scoping gate, and a
check that cries wolf stops being read — or component rendering, which this repo
has no jsdom or testing-library for. So it is a review rule, stated here because
the remaining batches (`lib/pdf`, `lib/domain`, `components/gesuch`, the config
content modules) are where most optional fields are still consumed.

The cheap way to actually see it: render a page as the sparse tenant.

```bash
# on the server, bypassing Caddy — evig has no address, phone or premises
curl -s -H 'Host: evig.hirnli.orangecat.ch' http://127.0.0.1:4012/strategie \
  | sed 's/<!-- -->//g' | grep -o '<strong>[^<]*:</strong>[^<]*<' | sort -u
```

That lists candidates, not findings. Most labels are legitimately followed by a
nested tag — a link, a list, a `<code>` — and show up the same way. Read them:
the unguarded ones have nothing between the label and the end of the line at
all, and appear only for the sparse tenant. Diffing against the same page for a
fully-populated tenant is what makes them obvious.

## Read the rendered artifact, not the status code

Two bugs shipped from this migration, both found only by looking at output:

- `strategie/components.tsx` printed `Laden: Lager:` — two labels, no values —
  for a tenant with no premises (#57).
- The pitch deck published `https://…/finanzen/wirkung`, one malformed link,
  because converting `<site>/finanzen und <site>/wirkung` collapsed the second
  URL and left `/wirkung` glued to the first (#59).

Same root cause both times: a find-and-replace across markup that spans lines,
where the surrounding prose is part of the construct being edited. Neither
showed up in typecheck, tests, lint or the build, and both endpoints returned
exactly what they were asked for — a 200, and a perfectly valid 8-page PDF.

So after converting a renderer, render it as the sparse tenant and read it.

```bash
# HTML — on the server, bypassing Caddy. evig has no address, phone,
# contactName, taxExemption or milestones, which is what makes it useful.
curl -s -H 'Host: evig.hirnli.orangecat.ch' http://127.0.0.1:4012/strategie \
  | sed 's/<!-- -->//g' | grep -o '<strong>[^<]*:</strong>[^<]*<'

# PDF — generate, copy back, extract the text.
ssh ubuntu@167.233.22.31 "curl -s -H 'Host: evig.hirnli.orangecat.ch' \
  http://127.0.0.1:4012/api/documents/pitch-deck -o /tmp/ev.pdf"
scp ubuntu@167.233.22.31:/tmp/ev.pdf . && pdftotext ev.pdf - | less
```

Read it for holes: a label with nothing after it, a URL with a stray path
segment, a sentence that stops mid-clause. The HTML grep lists candidates rather
than findings — a label followed by a nested link or list looks identical and is
fine; diffing against a fully-populated tenant is what makes the real ones
obvious.

## Computing the split

The client tree is the transitive closure of imports from every `'use client'`
file. To recompute after changes:

```bash
# files reachable from a client root, among ORG_PROFILE consumers
python3 - <<'PY'
import pathlib, re
src = pathlib.Path('src')
files = {str(p) for p in list(src.rglob('*.tsx')) + list(src.rglob('*.ts'))}
def is_client(p): return pathlib.Path(p).read_text().lstrip().startswith("'use client'")
def imports_of(f):
    t = pathlib.Path(f).read_text(); out = []
    for m in re.finditer(r"from '(@/[^']+)'", t):
        base = 'src/' + m.group(1)[2:]
        for ext in ('.tsx', '.ts', '/index.tsx', '/index.ts'):
            if base + ext in files: out.append(base + ext); break
    return out
seen = {f for f in files if is_client(f)}; stack = list(seen)
while stack:
    for imp in imports_of(stack.pop()):
        if imp not in seen: seen.add(imp); stack.append(imp)
for f in sorted(f for f in files if 'ORG_PROFILE' in pathlib.Path(f).read_text()):
    print(('CLIENT-TREE ' if f in seen else 'SERVER      ') + f)
PY
```

Measured 2026-09-03: **13 in the client tree, 61 server-only.**

## Order, and the one that is not mechanical

The `lib/config/*` files in the client tree — `stories.ts`, `numbers.ts`,
`metrics.ts`, `budget-scenarios.ts`, `schwerpunkte.ts` — should **not** be given
a tenant parameter. They are one customer's *content*, and their destination is
`org_content`, not a function signature. Threading a tenant through them would
be work thrown away when the content moves.

So: components and server pages first, domain composers second (they take a
parameter), and the config modules last, as part of moving content to
`org_content`. `ORG_PROFILE` can only be deleted after that — and deleting it is
the point, since leaving it as a fallback restores the second source of truth.
