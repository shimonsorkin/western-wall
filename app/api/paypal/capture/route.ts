import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const origin = req.headers.get("origin") || req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${origin}/donate?error=true`);
  }

  try {
    const captured = await captureOrder(token);

    if (captured.status === "COMPLETED") {
      return NextResponse.redirect(`${origin}/donate?success=true`);
    }

    return NextResponse.redirect(`${origin}/donate?error=true`);
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.redirect(`${origin}/donate?error=true`);
  }
}
