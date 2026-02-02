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

async function getOrCreateProduct(
  stripe: Stripe,
  frequency: string
): Promise<Stripe.Product> {
  const name =
    frequency === "annual"
      ? "The Moscow Times — Annual Donation"
      : "The Moscow Times — Monthly Donation";

  const products = await stripe.products.list({ active: true, limit: 100 });
  const existing = products.data.find((p) => p.name === name);
  if (existing) return existing;

  return stripe.products.create({ name });
}

async function getOrCreatePrice(
  stripe: Stripe,
  productId: string,
  amount: number,
  currency: string,
  interval: "month" | "year"
): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({
    product: productId,
    currency,
    active: true,
    limit: 100,
  });

  const existing = prices.data.find(
    (p) => p.unit_amount === amount * 100 && p.recurring?.interval === interval
  );
  if (existing) return existing;

  return stripe.prices.create({
    product: productId,
    unit_amount: amount * 100,
    currency,
    recurring: { interval },
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });

    const { amount, frequency, currency, firstName, lastName, email } =
      await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const safeCurrency = ALLOWED_CURRENCIES.includes(currency)
      ? currency
      : "usd";
    const symbol = CURRENCY_SYMBOLS[safeCurrency] || "$";

    const isOneTime = frequency === "one-time";
    const interval: "month" | "year" =
      frequency === "annual" ? "year" : "month";
    const origin = req.headers.get("origin") || "http://localhost:3000";

    let session: Stripe.Checkout.Session;

    if (isOneTime) {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: safeCurrency,
              product_data: {
                name: "The Moscow Times — One-time Donation",
                description: `${symbol}${amount} one-time donation to The Moscow Times`,
              },
              unit_amount: amount * 100,
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
    } else {
      const product = await getOrCreateProduct(stripe, frequency);
      const price = await getOrCreatePrice(
        stripe,
        product.id,
        amount,
        safeCurrency,
        interval
      );

      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [{ price: price.id, quantity: 1 }],
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
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
