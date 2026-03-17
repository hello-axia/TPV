import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from("bound_weekly_leaderboard")
    .select("username, avg_percentile, days_played");

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ leaderboard: data ?? [] });
}