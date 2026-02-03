import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    // PayPal has no embeddable billing portal.
    // Direct users to their PayPal account's automatic payments page.
    return NextResponse.json({
      url: "https://www.paypal.com/myaccount/autopay/",
    });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
