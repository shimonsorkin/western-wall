"use client";

import { useState } from "react";
import { Background } from "@/components/background";
import { Footer } from "@/components/footer";
import { Newsletter, newsletters, type NewsletterType } from "@/components/newsletter";

export default function Home() {
  const [videoSrc, setVideoSrc] = useState<string>(newsletters.weekly.video);

  return (
    <main className="p-inset h-[100dvh] w-full">
      <div className="relative h-full w-full">
        <Background src={videoSrc} placeholder="/placeholder-weekly.jpg" />
        <Newsletter onNewsletterChange={(type: NewsletterType) => setVideoSrc(newsletters[type].video)} />
        <Footer />
      </div>
    </main>
  );
}
