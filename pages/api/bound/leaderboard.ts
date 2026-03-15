import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { day } = req.query;
  if (!day || typeof day !== "string") {
    return res.status(400).json({ error: "Missing day param" });
  }

  const { data: submissions, error } = await supabase
    .from("bound_submissions")
    .select("seconds, user_id, word")
    .eq("local_day_key", day)
    .order("seconds", { ascending: true })
    .limit(5);

  if (error) return res.status(500).json({ error: error.message });

  const userIds = (submissions ?? []).map((s: any) => s.user_id).filter(Boolean);

  let usernameMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      usernameMap[p.id] = p.username ?? "Anonymous";
    }
  }

  const leaderboard = (submissions ?? []).map((row: any, i: number) => ({
    rank: i + 1,
    username: usernameMap[row.user_id] ?? "Anonymous",
    seconds: row.seconds,
    word: row.word ?? null,
  }));

  res.status(200).json({ leaderboard });
}