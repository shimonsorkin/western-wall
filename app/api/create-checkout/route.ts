import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const ALLOWED_CURRENCIES = ["gbp", "usd", "aud", "eur", "nzd", "cad"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  gbp: "£",
  usd: "$",
  aud: "AU$",
  eur: "€",
  nzd: "NZ$",
  cad: "CA$",
};

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });

    const { amount, frequency, currency, firstName, lastName, email } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const safeCurrency = ALLOWED_CURRENCIES.includes(currency) ? currency : "usd";
    const symbol = CURRENCY_SYMBOLS[safeCurrency] || "$";

    const isOneTime = frequency === "one-time";
    const interval = frequency === "annual" ? "year" : "month";
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const productName = isOneTime
      ? "The Moscow Times — One-time Donation"
      : `The Moscow Times — ${frequency === "annual" ? "Annual" : "Monthly"} Donation`;

    const productDescription = isOneTime
      ? `${symbol}${amount} one-time donation to The Moscow Times`
      : `${symbol}${amount}/${interval} recurring donation to The Moscow Times`;

    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: safeCurrency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: amount * 100,
            ...(isOneTime ? {} : { recurring: { interval } }),
          },
          quantity: 1,
        },
      ],
      metadata: {
        firstName,
        lastName,
        donorEmail: email,
        frequency,
        amount: String(amount),
        currency: safeCurrency,
      },
      success_url: `${origin}/donate?success=true`,
      cancel_url: `${origin}/donate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
