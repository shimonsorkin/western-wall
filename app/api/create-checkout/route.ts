import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  createOrder,
  getOrCreateProduct,
  getOrCreatePlan,
  createSubscription,
} from "@/lib/paypal";

const ALLOWED_CURRENCIES = ["gbp", "usd", "aud", "eur", "nzd", "cad"];

export async function POST(req: NextRequest) {
  try {
    const { amount, frequency, currency, name, email, prayer } =
      await req.json();

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const safeCurrency = ALLOWED_CURRENCIES.includes(currency)
      ? currency
      : "usd";

    const numericAmount = Number(amount) || 0;
    const isOneTime = frequency === "one-time";

    // Build metadata to store in PayPal fields
    const customId = JSON.stringify({ name, email }).slice(0, 127);
    const description = (prayer || "Prayer at the Western Wall").slice(0, 127);

    // Prayer-only submission (no donation)
    if (numericAmount <= 0) {
      // Fire-and-forget Mailchimp, then redirect to success
      tagMailchimp(email, name);
      return NextResponse.json({ url: `${origin}/donate?success=true` });
    }

    let approvalUrl: string | undefined;

    if (isOneTime) {
      const order = await createOrder({
        amount: numericAmount,
        currency: safeCurrency,
        description,
        customId,
        returnUrl: `${origin}/api/paypal/capture`,
        cancelUrl: `${origin}/donate`,
      });

      approvalUrl = order.links?.find(
        (l) => l.rel === "payer-action"
      )?.href;
    } else {
      // Recurring: weekly / monthly / annual
      const productId = await getOrCreateProduct();
      const planId = await getOrCreatePlan(
        productId,
        frequency,
        safeCurrency,
        numericAmount
      );

      const subscription = await createSubscription({
        planId,
        email: email?.trim() || "",
        name: name?.trim() || "",
        customId,
        returnUrl: `${origin}/donate?success=true`,
        cancelUrl: `${origin}/donate`,
      });

      approvalUrl = subscription.links?.find(
        (l) => l.rel === "approve"
      )?.href;
    }

    if (!approvalUrl) {
      return NextResponse.json(
        { error: "No approval URL returned from PayPal" },
        { status: 500 }
      );
    }

    // Add donor to Mailchimp (fire-and-forget)
    tagMailchimp(email, name);

    return NextResponse.json({ url: approvalUrl });
  } catch (err) {
    console.error("PayPal checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// ── Mailchimp (fire-and-forget) ────────────────────────────────────────

function tagMailchimp(email?: string, name?: string) {
  const mcKey = process.env.MAILCHIMP_API_KEY || "";
  const mcAudience = process.env.MAILCHIMP_AUDIENCE_ID || "";
  const mcServer = mcKey.split("-").pop() || "";

  if (!mcKey || !mcAudience || !email) return;

  const hash = createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  const mcBase = `https://${mcServer}.api.mailchimp.com/3.0`;
  const mcHeaders = {
    Authorization: `apikey ${mcKey}`,
    "Content-Type": "application/json",
  };

  fetch(`${mcBase}/lists/${mcAudience}/members/${hash}`, {
    method: "PUT",
    headers: mcHeaders,
    body: JSON.stringify({
      email_address: email.trim(),
      status_if_new: "subscribed",
      merge_fields: { FNAME: name?.trim() || "" },
    }),
  })
    .then(() =>
      fetch(`${mcBase}/lists/${mcAudience}/members/${hash}/tags`, {
        method: "POST",
        headers: mcHeaders,
        body: JSON.stringify({
          tags: [{ name: "Donor", status: "active" }],
        }),
      })
    )
    .catch(() => {});
}
