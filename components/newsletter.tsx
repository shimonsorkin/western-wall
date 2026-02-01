"use client";

import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { FormNewsletter } from "./form-newsletter";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons";
import { inputVariants } from "./ui/input";
import { useIsV0 } from "@/lib/context";

const DURATION = 0.3;
const DELAY = DURATION;
const EASE_OUT = "easeOut";
const EASE_OUT_OPACITY = [0.25, 0.46, 0.45, 0.94] as const;
const SPRING = {
  type: "spring" as const,
  stiffness: 60,
  damping: 10,
  mass: 0.8,
};

export const newsletters = {
  weekly: {
    label: "Weekly",
    description:
      "A hand-picked selection of news, features, analysis and more from The Moscow Times. Never miss the latest from Russia.",
    video: "/Moscow_VHS_Loop_PingPong.mp4",
  },
  regions: {
    label: "Regions Calling",
    description:
      "A deep dive into Russia's regions — stories, insights and developments beyond Moscow and St. Petersburg, delivered straight to your inbox.",
    video: "/Regions_PingPong.mp4",
  },
} as const;

export type NewsletterType = keyof typeof newsletters;

export const Newsletter = ({ onNewsletterChange }: { onNewsletterChange?: (type: NewsletterType) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNewsletter, setActiveNewsletter] = useState<NewsletterType>("weekly");

  const isInitialRender = useRef(true);

  useEffect(() => {
    return () => {
      isInitialRender.current = false;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex overflow-hidden relative flex-col gap-6 justify-center items-center pt-10 w-full h-full short:lg:pt-10 pb-footer-safe-area 2xl:pt-footer-safe-area px-sides">
      <motion.div
        layout="position"
        transition={{ duration: DURATION, ease: EASE_OUT }}
      >
        <img
          src="/logo_tmt.svg"
          alt="The Moscow Times"
          className="h-16 sm:h-20 lg:h-24 w-auto"
        />
      </motion.div>

      <div className="flex flex-col items-center min-h-0 shrink">
        <AnimatePresenceGuard>
          {!isOpen && (
            <motion.div
              key="newsletter"
              initial={isInitialRender.current ? false : "hidden"}
              animate="visible"
              exit="exit"
              variants={{
                visible: {
                  scale: 1,
                  transition: {
                    delay: DELAY,
                    duration: DURATION,
                    ease: EASE_OUT,
                  },
                },
                hidden: {
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT },
                },
                exit: {
                  y: -150,
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT },
                },
              }}
            >
              <div className="flex flex-col w-full max-w-xl">
                <motion.div
                  initial={isInitialRender.current ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: DURATION, ease: EASE_OUT_OPACITY },
                  }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY,
                  }}
                  className="flex justify-center"
                >
                  <div className="inline-flex rounded-full p-1 backdrop-blur-sm bg-primary/10 border border-border/30 ring-1 ring-border/10">
                    {(Object.keys(newsletters) as NewsletterType[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setActiveNewsletter(key); onNewsletterChange?.(key); }}
                        className={cn(
                          "relative px-5 py-1.5 rounded-full text-base font-serif font-light transition-colors duration-200",
                          activeNewsletter === key
                            ? "text-primary-foreground"
                            : "text-foreground/70 hover:text-foreground"
                        )}
                      >
                        {activeNewsletter === key && (
                          <motion.div
                            layoutId="newsletter-pill"
                            className="absolute inset-0 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                        <span className="relative z-10">{newsletters[key].label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
                <FormNewsletter
                  input={(props) => (
                    /* @ts-expect-error - Type mismatch */
                    <motion.input
                      autoCapitalize="off"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className={cn(inputVariants(), "font-serif")}
                      initial={isInitialRender.current ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: DURATION,
                          ease: EASE_OUT_OPACITY,
                        },
                      }}
                      transition={{
                        duration: DURATION,
                        ease: EASE_OUT,
                        delay: DELAY,
                      }}
                      {...props}
                    />
                  )}
                  submit={(props) => (
                    /* @ts-expect-error - Type mismatch */
                    <motion.button
                      className={buttonVariants({
                        variant: "iconButton",
                        size: "icon-xl",
                      })}
                      {...props}
                      initial={isInitialRender.current ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: DURATION,
                          ease: EASE_OUT_OPACITY,
                        },
                      }}
                      transition={{
                        duration: DURATION,
                        ease: EASE_OUT,
                        delay: DELAY,
                      }}
                    >
                      <ArrowRightIcon className="w-4 h-4 text-current" />
                    </motion.button>
                  )}
                />
                <motion.p
                  initial={isInitialRender.current ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: DURATION, ease: EASE_OUT_OPACITY },
                  }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY,
                  }}
                  className="mt-6 font-serif text-base !leading-[1.4] font-light text-center text-foreground text-pretty"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeNewsletter}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                      className="block"
                    >
                      {newsletters[activeNewsletter].description}
                    </motion.span>
                  </AnimatePresence>
                </motion.p>
              </div>
            </motion.div>
          )}

          <motion.div
            layout="position"
            transition={SPRING}
            key="button"
            className={isOpen ? "my-6" : "mt-6"}
          >
            <Button
              className={cn("relative px-8 text-base font-serif")}
              size="lg"
              onClick={() => setIsOpen(!isOpen)}
              shine={!isOpen}
            >
              <motion.span
                animate={{ x: isOpen ? -16 : 0 }}
                transition={{ duration: DURATION, ease: EASE_OUT }}
                className="inline-block"
              >
                Letter from the publisher
              </motion.span>

              {isOpen && (
                <motion.div
                  className={cn(
                    buttonVariants({ variant: "iconButton", size: "icon" }),
                    "absolute -top-px -right-px aspect-square"
                  )}
                  initial={{ opacity: 0, scale: 0.8, rotate: -40 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    duration: DURATION,
                    ease: EASE_OUT,
                    delay: DELAY,
                  }}
                >
                  <Cross1Icon className="size-5 text-primary-foreground" />
                </motion.div>
              )}
            </Button>
          </motion.div>

          {isOpen && (
            <motion.div
              key="manifesto"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: DELAY,
                    duration: DURATION,
                    ease: EASE_OUT,
                  },
                },
                hidden: {
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT },
                },
                exit: {
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: DURATION, ease: EASE_OUT_OPACITY },
                },
              }}
              className="relative flex min-h-0 flex-shrink overflow-hidden text-base max-h-[calc(70dvh-var(--footer-safe-area))] flex-col gap-8 text-center backdrop-blur-xl text-balance border-2 border-border/50 bg-primary/20 max-w-3xl text-foreground rounded-3xl ring-1 ring-offset-primary/10 ring-border/10 ring-offset-2 shadow-button"
            >
              <article className="relative overflow-y-auto p-6 h-full [&_p]:my-4 font-serif font-light">
                <p>Dear friends! On July 10, 2024, the Russian Prosecutor General&apos;s Office declared The Moscow Times, the oldest independent Russian media outlet, an &quot;undesirable&quot; organization. The official reason?</p>
                <p className="italic">&laquo;For discrediting the decisions of the Russian leadership in both foreign and domestic policy&raquo;</p>
                <p className="italic">(&laquo;За дискредитацию решений руководства Российской Федерации как во внешней, так и во внутренней политике&raquo;).</p>
                <p>While this might make for a good toast, there was nothing fun about this designation for our team and our readers in Russia. It only brought new risks and challenges.</p>
                <p>In hitting us with this label, the Russian authorities hoped we would no longer be able to report on Russia in an engaging, objective way — and that our readers would stop paying attention.</p>
                <p>But in reality, the opposite happened.</p>
                <p>In 2024, traffic and engagement on all of our main platforms grew significantly compared to the previous year. By the end of the year, MT had become the second-largest exiled Russian media outlet online, according to Similar web statistics. We&apos;ve evolved into a true multimedia publication, constantly experimenting with new formats and distribution channels to maximize our impact. Though we started as a print newspaper over three decades ago, most of our audience growth in 2024-2025 came from YouTube, Instagram and TikTok.</p>
                <p>And there&apos;s more: in July 2024, the same month we were named &quot;undesirable,&quot; donations to The Moscow Times increased by 130% compared to the previous month — and we received twice as many donations in 2024 overall! We are infinitely grateful to you for this support. It&apos;s what keeps us going and allows us to continue serving both our Russian- and English-speaking audiences. Thank you — and please, keep it up!</p>
                <p className="mt-8">
                  <strong>Alexander Gubsky</strong><br />
                  Publisher
                </p>
              </article>
            </motion.div>
          )}
        </AnimatePresenceGuard>
      </div>
    </div>
  );
};

const AnimatePresenceGuard = ({ children }: { children: React.ReactNode }) => {
  const isV0 = useIsV0();

  return isV0 ? <>{children}</> : <AnimatePresence mode="popLayout" propagate>{children}</AnimatePresence>;
};
