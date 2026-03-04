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

function getBearer(req: NextApiRequest) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

// Admin client (server-only)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Anon client ONLY for validating the bearer token -> user id
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "").trim();
  if (!id) return res.status(400).json({ error: "Missing id" });

  res.setHeader("Cache-Control", "no-store");

  async function fetchQuestion(): Promise<QuestionRow | null> {
    const { data, error } = await supabaseAdmin
      .from("tpv_questions")
      .select("id,prompt,a_text,b_text,c_text,d_text,a_count,b_count,c_count,d_count")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as QuestionRow;
  }

  async function getUserIdFromBearer(): Promise<string | null> {
    const token = getBearer(req);
    if (!token) return null;

    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) return null;

    return data.user.id;
  }

  // -------- GET ----------
  if (req.method === "GET") {
    const question = await fetchQuestion();
    if (!question) return res.status(404).json({ error: "Question not found" });

    const uid = await getUserIdFromBearer();
    if (!uid) return res.status(200).json({ question, voted: null });

    const { data: voteRow, error: voteErr } = await supabaseAdmin
      .from("tpv_question_votes")
      .select("choice")
      .eq("question_id", id)
      .eq("user_id", uid)
      .maybeSingle();

    if (voteErr) return res.status(500).json({ error: voteErr.message });

    return res.status(200).json({ question, voted: (voteRow?.choice as any) ?? null });
  }

  // -------- POST ----------
  if (req.method === "POST") {
    const uid = await getUserIdFromBearer();
    if (!uid) return res.status(401).json({ error: "Sign in to vote" });

    const choice = String(req.body?.choice ?? "").toUpperCase();
    if (!["A", "B", "C", "D"].includes(choice)) {
      return res.status(400).json({ error: "Invalid choice" });
    }

    // If they already voted, return the question + their existing vote
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("tpv_question_votes")
      .select("choice")
      .eq("question_id", id)
      .eq("user_id", uid)
      .maybeSingle();

    if (existingErr) return res.status(500).json({ error: existingErr.message });

    if (existing?.choice) {
      const question = await fetchQuestion();
      if (!question) return res.status(404).json({ error: "Question not found" });
      return res.status(200).json({ question, voted: existing.choice });
    }

    // Call RPC (now it will NOT throw "already voted")
    const { data, error } = await supabaseAdmin.rpc("tpv_vote_question_user", {
      qid: id,
      choice,
      uid,
    });

    if (error || !data) {
      return res.status(500).json({ error: error?.message || "Vote failed" });
    }

    return res.status(200).json({ question: data as QuestionRow, voted: choice });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}