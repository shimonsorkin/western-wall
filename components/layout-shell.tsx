"use client";

import { Background } from "./background";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-inset h-[100dvh] w-full">
      <div className="relative h-full w-full">
        <Background src="/Moscow_VHS_Loop_PingPong.mp4" placeholder="/placeholder-weekly.jpg" />
        {children}
      </div>
    </main>
  );
}
