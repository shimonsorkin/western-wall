import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "missing_message" }, { status: 400 });
    }

    // TODO: Connect to an email service (e.g. Resend, SendGrid, or forward via Mailchimp)
    // For now, log the contact message on the server
    console.log("Contact form submission:", {
      name: name?.trim() || "",
      email: email.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
