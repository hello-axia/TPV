// lib/supabaseClients.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function makeBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During `next build`, this file is imported on the server.
  // We must NOT throw or create a client there.
  if (typeof window === "undefined") {
    return null as unknown as SupabaseClient;
  }

  // In the browser, these MUST exist.
  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anon);
}

/**
 * Use this in client-side code (components, click handlers, useEffect, etc.)
 */
export const supabase: SupabaseClient =
  browserClient ?? (browserClient = makeBrowserClient());