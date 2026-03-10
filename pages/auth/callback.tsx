import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClients";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/");
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, onboarding_complete")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.onboarding_complete) {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    })();
  }, [router]);

  return null;
}