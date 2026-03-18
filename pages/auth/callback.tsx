import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClients";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Exchange the code in the URL for a session
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.user) {
        router.replace("/signin");
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", data.session.user.id)
          .single();

        if (!profile?.onboarding_complete) {
          router.replace("/onboarding");
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/onboarding");
      }
    })();
  }, [router]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Signing you in…
      </div>
    </div>
  );
}