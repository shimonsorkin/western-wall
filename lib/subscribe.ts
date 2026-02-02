"use server";

import { ActionResult, error, success } from "./utils";
import { newsletterSchema } from "./schema";
import { createHash } from "crypto";

const API_KEY = process.env.MAILCHIMP_API_KEY || "";
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || "";
const SERVER_PREFIX = API_KEY.split("-").pop() || "";
const BASE_URL = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0`;

const IS_DEMO = !API_KEY || !AUDIENCE_ID;

function md5(email: string): string {
  return createHash("md5").update(email.toLowerCase()).digest("hex");
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `apikey ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export const subscribe = async (
  email: string,
  tag: string,
  mergeFields?: Record<string, string>
): Promise<ActionResult<string>> => {
  if (IS_DEMO) {
    return error("Missing required setup");
  }

  const parsed = newsletterSchema.safeParse({ email });

  if (!parsed.success) {
    return error(parsed.error.message);
  }

  const subscriberHash = md5(parsed.data.email);

  try {
    // Upsert member to audience
    const memberRes = await fetch(
      `${BASE_URL}/lists/${AUDIENCE_ID}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          email_address: parsed.data.email,
          status_if_new: "subscribed",
          ...(mergeFields && { merge_fields: mergeFields }),
        }),
      }
    );

    if (!memberRes.ok) {
      const body = await memberRes.json();
      return error(body.detail || "Failed to subscribe");
    }

    // Assign the newsletter tag
    const tagRes = await fetch(
      `${BASE_URL}/lists/${AUDIENCE_ID}/members/${subscriberHash}/tags`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          tags: [{ name: tag, status: "active" }],
        }),
      }
    );

    if (!tagRes.ok) {
      const body = await tagRes.json();
      return error(body.detail || "Failed to assign tag");
    }

    return success("Thank you for subscribing!");
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Error subscribing to email list"
    );
  }
};

export const getDemoState = async () => {
  return IS_DEMO;
};
