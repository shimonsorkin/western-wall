import type { Metadata } from "next";
import { headers } from "next/headers";
import { Background } from "@/components/background";
import { Donation } from "@/components/donation";

export const metadata: Metadata = {
  title: "Support The Moscow Times",
};

export default async function DonatePage() {
  const headersList = await headers();
  const detectedCountry = headersList.get("x-vercel-ip-country") || "US";

  return (
    <main className="p-inset h-[100dvh] w-full">
      <div className="relative h-full w-full">
        <Background src="/Moscow_VHS_Loop_PingPong.mp4" placeholder="/placeholder-weekly.jpg" />
        <Donation detectedCountry={detectedCountry} />
      </div>
    </main>
  );
}
