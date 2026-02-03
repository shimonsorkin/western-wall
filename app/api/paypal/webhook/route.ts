import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type as string;

    // TODO: Verify webhook signature using PayPal API
    // POST /v1/notifications/verify-webhook-signature

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        console.log("Payment captured:", body.resource?.id);
        break;
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        console.log("Subscription activated:", body.resource?.id);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        console.log("Subscription cancelled:", body.resource?.id);
        break;
      default:
        console.log("Unhandled PayPal event:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "webhook_error" }, { status: 400 });
  }
}
