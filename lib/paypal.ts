const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

// ── In-memory token cache ──────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token as string;
  // Expire 60 s before actual expiry to be safe
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

// ── Generic fetch wrapper ──────────────────────────────────────────────
async function paypalFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal API ${path} failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Orders API v2 (one-time payments) ──────────────────────────────────

interface CreateOrderParams {
  amount: number;
  currency: string;
  description: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
}

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: PayPalLink[];
}

export async function createOrder({
  amount,
  currency,
  description,
  customId,
  returnUrl,
  cancelUrl,
}: CreateOrderParams): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          description: description.slice(0, 127),
          custom_id: customId.slice(0, 127),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "Western Wall Notes",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  });
}

export async function captureOrder(
  orderId: string
): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}

// ── Catalog Products API ───────────────────────────────────────────────

interface PayPalProduct {
  id: string;
  name: string;
}

interface PayPalProductList {
  products: PayPalProduct[];
}

const PRODUCT_NAME = "Western Wall Prayer Service";

export async function getOrCreateProduct(): Promise<string> {
  const list = await paypalFetch<PayPalProductList>(
    "/v1/catalogs/products?page_size=20&total_required=true"
  );

  const existing = list.products?.find((p) => p.name === PRODUCT_NAME);
  if (existing) return existing.id;

  const product = await paypalFetch<PayPalProduct>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: PRODUCT_NAME,
      description: "Recurring prayer placement at the Western Wall",
      type: "SERVICE",
      category: "CHARITY",
    }),
  });

  return product.id;
}

// ── Billing Plans API ──────────────────────────────────────────────────

type PlanInterval = "WEEK" | "MONTH" | "YEAR";

interface PayPalPlan {
  id: string;
  name: string;
  status: string;
  billing_cycles: {
    pricing_scheme: { fixed_price: { value: string; currency_code: string } };
    frequency: { interval_unit: string };
  }[];
}

interface PayPalPlanList {
  plans: PayPalPlan[];
}

function frequencyToInterval(
  freq: string
): { interval: PlanInterval; label: string } {
  switch (freq) {
    case "weekly":
      return { interval: "WEEK", label: "Weekly" };
    case "monthly":
      return { interval: "MONTH", label: "Monthly" };
    case "annual":
      return { interval: "YEAR", label: "Yearly" };
    default:
      return { interval: "MONTH", label: "Monthly" };
  }
}

export async function getOrCreatePlan(
  productId: string,
  frequency: string,
  currency: string,
  amount: number
): Promise<string> {
  const { interval, label } = frequencyToInterval(frequency);
  const currencyUpper = currency.toUpperCase();
  const amountStr = amount.toFixed(2);

  // Check existing plans for this product
  const list = await paypalFetch<PayPalPlanList>(
    `/v1/billing/plans?product_id=${productId}&page_size=20&total_required=true`
  );

  const existing = list.plans?.find((p) => {
    if (p.status !== "ACTIVE") return false;
    const cycle = p.billing_cycles?.[0];
    if (!cycle) return false;
    return (
      cycle.frequency.interval_unit === interval &&
      cycle.pricing_scheme.fixed_price.value === amountStr &&
      cycle.pricing_scheme.fixed_price.currency_code === currencyUpper
    );
  });

  if (existing) return existing.id;

  const plan = await paypalFetch<PayPalPlan>("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      name: `${label} Prayer — ${currencyUpper} ${amountStr}`,
      description: `${label} prayer placement at the Western Wall`,
      billing_cycles: [
        {
          frequency: { interval_unit: interval, interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // unlimited
          pricing_scheme: {
            fixed_price: { value: amountStr, currency_code: currencyUpper },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });

  return plan.id;
}

// ── Subscriptions API ──────────────────────────────────────────────────

interface PayPalSubscription {
  id: string;
  status: string;
  links: PayPalLink[];
}

interface CreateSubscriptionParams {
  planId: string;
  email: string;
  name: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createSubscription({
  planId,
  email,
  name,
  customId,
  returnUrl,
  cancelUrl,
}: CreateSubscriptionParams): Promise<PayPalSubscription> {
  return paypalFetch<PayPalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      subscriber: {
        name: { given_name: name || "Donor" },
        email_address: email,
      },
      custom_id: customId.slice(0, 127),
      application_context: {
        brand_name: "Western Wall Notes",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });
}
