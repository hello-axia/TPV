import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Body = {
  email?: string;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY on server" });
  }

  const { email, message } = (req.body || {}) as Body;

  if (!email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await resend.emails.send({
      from: "TPV Contact <onboarding@resend.dev>", // OK for dev/test
      to: ["ello.axia@gmail.com"],
      subject: `New TPV Contact Message from ${email}`,
      text: message,
      replyTo: email, // ✅ correct key for Resend SDK
    });

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (err: any) {
    // Surface the real reason in terminal + return a useful message
    console.error("Resend error:", err);

    const msg =
      err?.message ||
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Email failed to send";

    return res.status(500).json({ error: msg });
  }
}