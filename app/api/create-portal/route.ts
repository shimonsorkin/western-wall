import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });

    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const customers = await stripe.customers.list({
      email: email.trim(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const features: Stripe.BillingPortal.ConfigurationCreateParams.Features = {
      subscription_cancel: { enabled: true },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
    };

    // Find or create portal configuration
    const configs = await stripe.billingPortal.configurations.list({
      limit: 10,
    });
    let configId: string;

    if (configs.data.length > 0) {
      await stripe.billingPortal.configurations.update(configs.data[0].id, {
        features,
      });
      configId = configs.data[0].id;
    } else {
      const config = await stripe.billingPortal.configurations.create({
        features,
        business_profile: {
          headline: "Manage your donation to The Moscow Times",
        },
      });
      configId = config.id;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/donate`,
      configuration: configId,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
