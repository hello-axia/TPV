import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { day, seconds } = req.query;
  if (!day || !seconds) return res.status(400).json({ error: "Missing params" });

  const sec = Number(seconds);

  const { count: total } = await supabase
    .from("bound_submissions")
    .select("*", { count: "exact", head: true })
    .eq("local_day_key", day);

  const { count: slower } = await supabase
    .from("bound_submissions")
    .select("*", { count: "exact", head: true })
    .eq("local_day_key", day)
    .gt("seconds", sec);

  if (!total || total === 0) {
    return res.status(200).json({ percentile: null, total: 0 });
  }

  const percentile = Math.round(((slower ?? 0) / total) * 1000) / 10;
  res.status(200).json({ percentile, total });
}