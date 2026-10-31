-- Pin search_path on the generic updated_at trigger function.
-- Resolves Supabase advisor lint 0011 (function_search_path_mutable).
-- The body only uses now() (pg_catalog), so an empty search_path is safe.
alter function public.set_updated_at() set search_path = '';
