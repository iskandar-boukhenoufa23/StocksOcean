# Legacy Migrations

This directory contains historical SQL scripts. The Supabase CLI does not manage or apply files from here; its migration source is `supabase/migrations/`.

The legacy scripts overlap and do not match the checked-in generated database types. Do not apply them to a linked project until they have been reconciled against the intended Supabase schema.

For local development, schema pulls, and type generation, follow [the Supabase workflow](../supabase/README.md).
