import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClients";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let redirected = false;

    async function handleSession(userId: string) {
      if (redirected) return;
      redirected = true;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", userId)
          .single();
        if (!profile?.onboarding_complete) {
          router.replace("/onboarding");
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/onboarding");
      }
    }

    // Primary: wait for Supabase to fire SIGNED_IN after processing the OAuth URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await handleSession(session.user.id);
        }
      }
    );

    // Fallback: if session already exists (page refresh), handle immediately
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user && !redirected) {
        handleSession(data.session.user.id);
      }
    });

    // Safety net: if nothing fires in 8 seconds, go to signin
    const timeout = setTimeout(() => {
      if (!redirected) {
        redirected = true;
        router.replace("/signin");
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Signing you in…
      </div>
    </div>
  );
}