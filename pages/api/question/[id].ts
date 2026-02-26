import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

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

// Admin client (server-only) — bypasses RLS for reading the question + counts
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseCookieHeader(header: string) {
  if (!header) return [];
  return header.split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=");
    return { name, value: decodeURIComponent(rest.join("=") || "") };
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "").trim();
  if (!id) return res.status(400).json({ error: "Missing id" });

  // Auth-aware Supabase client (anon + cookie session)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.cookie ?? "");
        },
        setAll(cookies) {
          const serialized = cookies.map(({ name, value, options }) => {
            let s = `${name}=${encodeURIComponent(value)}`;
            s += `; Path=${options?.path ?? "/"}`;

            if (options?.maxAge != null) s += `; Max-Age=${options.maxAge}`;
            if (options?.expires) s += `; Expires=${options.expires.toUTCString()}`;
            if (options?.httpOnly) s += `; HttpOnly`;
            if (options?.secure) s += `; Secure`;

            const sameSite = options?.sameSite;
            if (sameSite) {
              // sameSite is usually "lax" | "strict" | "none" in these types
              const v = String(sameSite);
              s += `; SameSite=${v[0].toUpperCase()}${v.slice(1)}`;
            } else {
              s += `; SameSite=Lax`;
            }

            return s;
          });

          const prev = res.getHeader("Set-Cookie");
          const prevArr = Array.isArray(prev) ? prev : prev ? [String(prev)] : [];
          res.setHeader("Set-Cookie", [...prevArr, ...serialized]);
        },
      },
    }
  );

  async function fetchQuestion(): Promise<QuestionRow | null> {
    const { data, error } = await supabaseAdmin
      .from("tpv_questions")
      .select(
        "id,prompt,a_text,b_text,c_text,d_text,a_count,b_count,c_count,d_count"
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as QuestionRow;
  }

  if (req.method === "GET") {
    const question = await fetchQuestion();
    if (!question) return res.status(404).json({ error: "Question not found" });

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) return res.status(500).json({ error: sessionErr.message });

    let voted: string | null = null;

    const user = sessionData.session?.user;
    if (user) {
      const { data: voteRow, error: voteErr } = await supabase
        .from("tpv_question_votes")
        .select("choice")
        .eq("question_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (voteErr) return res.status(500).json({ error: voteErr.message });
      voted = (voteRow?.choice as string) ?? null;
    }

    return res.status(200).json({ question, voted });
  }

  if (req.method === "POST") {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) return res.status(500).json({ error: sessionErr.message });

    const user = sessionData.session?.user;
    if (!user) return res.status(401).json({ error: "Sign in to vote" });

    const choice = String(req.body?.choice ?? "").toUpperCase();
    if (!["A", "B", "C", "D"].includes(choice)) {
      return res.status(400).json({ error: "Invalid choice" });
    }

    // Block duplicate votes (1 per user)
    const { data: existing, error: existingErr } = await supabase
      .from("tpv_question_votes")
      .select("choice")
      .eq("question_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingErr) return res.status(500).json({ error: existingErr.message });

    if (existing?.choice) {
      const question = await fetchQuestion();
      if (!question) return res.status(404).json({ error: "Question not found" });
      return res.status(200).json({ question, voted: existing.choice });
    }

    // Your SQL RPC should: insert vote row + increment counts + return updated question row
    const { data, error } = await supabase.rpc("tpv_vote_question_user", {
      qid: id,
      choice,
    });

    if (error || !data) {
      return res.status(500).json({ error: error?.message || "Vote failed" });
    }

    return res.status(200).json({ question: data as QuestionRow, voted: choice });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}