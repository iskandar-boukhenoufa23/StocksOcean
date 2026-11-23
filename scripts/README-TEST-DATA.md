# Local Test Data

Use the canonical seed at `supabase/seed.sql` for local development. With the Supabase CLI and Docker running, execute:

```bash
npm run db:reset
```

This resets the local database, applies migrations under `supabase/migrations/`, and inserts ten sample assets. The records use placeholder preview URLs and storage paths; no image or video files are uploaded. Do not run this reset against production.

For realistic upload and approval workflows, sign in through `/auth/signin`, upload from `/contributor/upload`, then review the submission in `/admin/dashboard`.
