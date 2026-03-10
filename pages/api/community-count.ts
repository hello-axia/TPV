import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "Missing env vars", url: !!url, key: !!key });
  }

  const supabase = createClient(url, key);

  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("committed", true);

  if (error) return res.status(500).json({ error: error.message });

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  res.status(200).json({ count: count ?? 0 });
}