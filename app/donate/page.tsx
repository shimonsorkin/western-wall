import type { Metadata } from "next";
import { headers } from "next/headers";
import { Donation } from "@/components/donation";

export const metadata: Metadata = {
  title: "Support The Moscow Times",
};

export default async function DonatePage() {
  const headersList = await headers();
  const detectedCountry = headersList.get("x-vercel-ip-country") || "US";

  return <Donation detectedCountry={detectedCountry} />;
}
