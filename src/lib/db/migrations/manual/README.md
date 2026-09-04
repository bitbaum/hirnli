# Manual migrations

Migrations in this directory are **not applied by the deploy.** Someone runs
them by hand and records them in the ledger.

## Why the directory exists

The deploy's schema step refuses to apply a destructive statement — `DROP TABLE`,
`DROP COLUMN`, `TRUNCATE`, `DELETE FROM`, a column type change — and aborts the
whole deploy when it finds one pending. That guard is right: an automated deploy
should never silently drop production data.

But it refuses the *batch*, not just the file. So a destructive migration sitting
in `../` blocks every deploy of every other change until somebody deals with it,
and the only way to deal with it is by hand. Worse, the schema step runs
**before** the new build ships, so letting it apply a `DROP COLUMN` would remove
the column out from under the build still serving traffic.

That is the wrong order for expand/contract. A contract step has to land *after*
the code that stopped reading the thing being dropped. Keeping these files out of
the auto-applied glob (`migrations/[0-9]*.sql`, which does not recurse) is what
makes that order possible.

## How to apply one

1. Merge and let the deploy ship the code that no longer reads the dropped
   columns or tables. Confirm the new build is serving — not just that CI was
   green.
2. Run the file against the database named in `apps.conf` for this app.
3. Record it, so the ledger reflects reality and a fresh database can tell what
   has already happened:

   ```sql
   INSERT INTO public._deploy_schema_history (tag)
   VALUES ('<filename without .sql>')
   ON CONFLICT DO NOTHING;
   ```

4. Note it in the PR that introduced it, with the date it was applied.

## The tradeoff, stated plainly

A brand-new database does not get these automatically — whoever provisions it has
to run this directory in order. That is the cost of the guarantee above, and it
is the smaller cost: a destructive migration needs a human either way, and this
way the deploy of ordinary changes is never held hostage to one.
