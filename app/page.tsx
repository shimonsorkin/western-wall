"use client";

import { useState } from "react";
import Link from "next/link";
import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Newsletter, newsletters, type NewsletterType } from "@/components/newsletter";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function Home() {
  const [videoSrc, setVideoSrc] = useState<string>(newsletters.weekly.video);
  const [letterOpen, setLetterOpen] = useState(false);

  return (
    <main className="p-inset h-[100dvh] w-full">
      <div className="relative h-full w-full">
        <Background src={videoSrc} placeholder="/placeholder-weekly.jpg" />
        <Newsletter
          onNewsletterChange={(type: NewsletterType) => setVideoSrc(newsletters[type].video)}
          onOpenChange={setLetterOpen}
        />
        <div className={`absolute bottom-[calc(var(--inset)+0.8rem)] md:bottom-[calc(var(--inset)+1.5rem)] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-300 ${letterOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <Button asChild shine size="lg" className="px-8 font-serif text-base font-bold">
            <Link href="/donate">
              Support The Moscow Times
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Button>
          <Footer />
        </div>
      </div>
    </main>
  );
}
