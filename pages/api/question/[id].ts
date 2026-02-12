import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type QuestionRow = {
  id: string;
  prompt: string;
  a_text: string;
  b_text: string;
  c_text: string;
  d_text: string;
  a_count: number;
  b_count: number;
  c_count: number;
  d_count: number;
};

function getCookie(req: NextApiRequest, name: string) {
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) return decodeURIComponent(p.slice(name.length + 1));
  }
  return null;
}

function setCookie(res: NextApiResponse, name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365;
  res.setHeader(
    "Set-Cookie",
    `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "").trim();
  if (!id) return res.status(400).json({ error: "Missing id" });

  const voteCookieName = `tpv_q_${id}`;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("tpv_questions")
      .select("id,prompt,a_text,b_text,c_text,d_text,a_count,b_count,c_count,d_count")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Question not found" });

    const voted = getCookie(req, voteCookieName);
    return res.status(200).json({ question: data as QuestionRow, voted });
  }

  if (req.method === "POST") {
    const already = getCookie(req, voteCookieName);
    if (already) {
      const { data, error } = await supabase
        .from("tpv_questions")
        .select("id,prompt,a_text,b_text,c_text,d_text,a_count,b_count,c_count,d_count")
        .eq("id", id)
        .single();

      if (error || !data) return res.status(404).json({ error: "Question not found" });
      return res.status(200).json({ question: data as QuestionRow, voted: already });
    }

    const choice = String((req.body?.choice ?? "")).toUpperCase();
    if (!["A", "B", "C", "D"].includes(choice)) {
      return res.status(400).json({ error: "Invalid choice" });
    }

    const { data, error } = await supabase.rpc("tpv_vote_question", {
      qid: id,
      choice,
    });

    if (error || !data) {
      return res.status(500).json({ error: error?.message || "Vote failed" });
    }

    setCookie(res, voteCookieName, choice);
    return res.status(200).json({ question: data as QuestionRow, voted: choice });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}