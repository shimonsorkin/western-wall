"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Newsletter } from "@/components/newsletter";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function Home() {
  const [letterOpen, setLetterOpen] = useState(false);

  return (
    <>
      <Newsletter
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
    </>
  );
}
