import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClients";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await supabase.auth.getSession();
      router.replace("/");
    })();
  }, [router]);

  return null;
}