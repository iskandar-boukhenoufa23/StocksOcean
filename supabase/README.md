# Supabase

## Local development

Install the Supabase CLI and Docker Desktop, then start the local stack:

```bash
npm run db:start
npm run db:reset
```

`db:reset` recreates the local database, applies migrations from `supabase/migrations/`, and loads `supabase/seed.sql`. It deletes local database data. The seed contains sample asset metadata with placeholder storage paths; it does not upload files.

## Pulling the remote schema

Authenticate and link this checkout to the intended Supabase project before pulling:

```bash
supabase login
supabase link --project-ref <project-ref>
npm run db:pull
supabase gen types typescript --linked --schema public > types/supabase.ts
```

Review the generated migration and types before committing them. Do not apply a pulled schema migration to production without reviewing its SQL.

## Migration source

The Supabase CLI reads migrations from `supabase/migrations/`. The separate root `migrations/` directory contains legacy SQL and is not automatically applied by the CLI. These directories and the checked-in generated types currently do not describe one consistent schema; pull and reconcile the intended remote schema before moving or applying the legacy migrations.
