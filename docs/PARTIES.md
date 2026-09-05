# Who is on this platform

Hirnli is the product. Everyone else is a party using it.

That sentence has been the hard part. The application was written for one
organisation, so for a long time "the organisation" meant that customer, and
foundations were rows in its research. Both assumptions are now removed from the
code, and this file says what replaced them so the next change does not
reintroduce either.

## Two kinds of party

| | **Seeker** | **Funder** |
|---|---|---|
| What it is | An organisation looking for funding | A foundation that gives it |
| Example | Revamp-IT, evig | the 16,623 register entries |
| Account | `organizations.kind = 'seeker'` | `organizations.kind = 'funder'` |
| Identity | `org_profiles` (`storedTenantProfileSchema`) | `funder_profiles` (`storedFunderProfileSchema`) |
| Content | `org_content` — its stories, numbers, pages | none; it maintains one register entry |
| Public site | yes, at `<slug>.hirnli.orangecat.ch` | no |
| Exists before an account? | no — an account creates it | **yes** — it is in the register already |

That last row is the important asymmetry. `provisionOrganization()` *creates* a
seeker: no account, no party. `claimFoundation()` *attaches* an account to a
funder that has existed all along, and refuses if another account already speaks
for it — two accounts claiming one foundation is a dispute the platform must not
settle by itself.

## Three layers on a foundation, and who owns each

```
fundraising_foundations               the REGISTER — the platform's research.
                                      Shared by every seeker, owned by none.

fundraising_foundation_assessments    what ONE SEEKER thinks of it: fit score,
                                      priority, research notes. Private to that
                                      seeker. Not visible to the foundation.

funder_profiles                       what the FOUNDATION says about ITSELF.
                                      Public, and authoritative where it
                                      disagrees with the register.
```

A foundation is the authority on its purpose, its focus, its deadlines, its
contact and what it typically gives. It is **not** the authority on how well it
matches an applicant, how thoroughly it has been researched, or which Schmuki
type it is — a foundation editing those would be marking its own homework. The
overlay writes only the fields in `FUNDER_AUTHORED_FIELDS`, and a test asserts
that list matches what it actually writes.

## Researched is not stated

A `funder_profiles` row is the platform's best understanding until
`confirmed_at` is set. Only then may it be shown as the foundation's own word.

This is the same rule that governs seeker content, in the other direction.
Putting one customer's certifications in another customer's pitch deck asserted
credentials nobody held; presenting our research as a foundation's statement
would put words in the mouth of an organisation that never agreed to them. An
applicant reads "they fund youth projects" and acts on it, so the difference is
not a footnote — the foundation detail page says which it is looking at.

## What is still seeker-shaped

Honest list, so nobody assumes this is finished:

- `getCurrentOrgId()` resolves a **host** to an org, and only seekers have
  hosts. Funders reach the platform through `/o/<slug>`, never a tenant site.
- The word *tenant* throughout `src/lib/tenant/` means *seeker*. The rename is
  cosmetic and large, so it has not been done; `OrgKind` is the load-bearing
  distinction.
- There is no UI to claim a foundation or edit a funder profile yet.
  `claimFoundation()` and `funder_profiles` are the mechanism; distributing
  accounts to foundation people is the product step that follows.
- Fit scoring still weights themes by one seeker's four pillars
  (`schwerpunkte.ts`), so every seeker is scored against that customer's idea of
  what matters. That is a seeker-content migration, tracked with the rest.
