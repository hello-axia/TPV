import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let redirected = false;

    async function handleUser() {
      if (redirected) return;

      // Import the shared client
      const { supabase } = await import("../../lib/supabaseClients");

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (redirected) return;
          if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
            redirected = true;
            subscription.unsubscribe();

            // Create a fresh client with the session token explicitly set
            // so RLS auth.uid() works correctly
            const authedClient = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              {
                global: {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                },
              }
            );

            try {
              const { data: profile } = await authedClient
                .from("profiles")
                .select("onboarding_complete")
                .eq("id", session.user.id)
                .single();

              if (profile?.onboarding_complete) {
                router.replace("/");
              } else {
                router.replace("/onboarding");
              }
            } catch {
              router.replace("/onboarding");
            }
          }
        }
      );

      // Safety net — 8 seconds then give up
      setTimeout(() => {
        if (!redirected) {
          redirected = true;
          router.replace("/signin");
        }
      }, 8000);
    }

    handleUser();
  }, [router]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Signing you in…
      </div>
    </div>
  );
}