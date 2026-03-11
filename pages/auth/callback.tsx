import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClients";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", session.user.id)
          .single();

        if (!profile?.onboarding_complete) {
          router.replace("/onboarding");
        } else {
          router.replace("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.82rem",
        color: "var(--text-faint)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Signing you in…
      </div>
    </div>
  );
}