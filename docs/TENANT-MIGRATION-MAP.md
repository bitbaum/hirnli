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
