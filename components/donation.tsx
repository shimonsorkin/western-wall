"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { inputVariants } from "./ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiVisa,
  SiMastercard,
  SiPaypal,
} from "react-icons/si";
import { FaCcAmex, FaGooglePay } from "react-icons/fa6";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";

const CURRENCIES = [
  { code: "gbp", symbol: "£", label: "UK £", countries: ["GB"] },
  { code: "usd", symbol: "$", label: "US $", countries: ["US"] },
  { code: "aud", symbol: "AU$", label: "Australia AU$", countries: ["AU"] },
  {
    code: "eur",
    symbol: "€",
    label: "Europe €",
    countries: [
      "DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "FI", "PT",
      "GR", "LU", "SK", "SI", "LV", "LT", "EE", "CY", "MT", "HR",
    ],
  },
  { code: "nzd", symbol: "NZ$", label: "New Zealand NZ$", countries: ["NZ"] },
  { code: "cad", symbol: "CA$", label: "Canada CA$", countries: ["CA"] },
  { code: "usd", symbol: "$", label: "International US$", countries: [] },
] as const;

type CurrencyIndex = number;

function detectCurrencyIndex(country: string): CurrencyIndex {
  const idx = CURRENCIES.findIndex((c) =>
    c.countries.includes(country as never)
  );
  return idx !== -1 ? idx : CURRENCIES.length - 1; // fallback to "International US$"
}

const frequencies = {
  "one-time": { label: "One-time", interval: null },
  weekly: { label: "Weekly", interval: "week" },
  monthly: { label: "Monthly", interval: "month" },
  annual: { label: "Yearly", interval: "year" },
} as const;

type Frequency = keyof typeof frequencies;

const MIN_AMOUNT = 3;

const FAQ_ITEMS = [
  {
    q: "How does the prayer placement work?",
    a: "After you submit your prayer, one of our team members in Jerusalem handwrites it on a note and personally places it between the ancient stones of the Western Wall (Kotel). This is done with care and reverence, following the centuries-old tradition.",
  },
  {
    q: "How long until my prayer is placed?",
    a: "We place most prayers within 24\u201348 hours of submission. During Jewish holidays or times of high volume, it may take slightly longer, but we always aim to place your note as soon as possible.",
  },
  {
    q: "Will I receive confirmation?",
    a: "Yes. Once your prayer has been placed, we send a photo confirmation to the email address you provided, so you can see your note at the Wall.",
  },
  {
    q: "Is my prayer kept private?",
    a: "Absolutely. Your prayer is treated with complete confidentiality. Only the team member who handwrites and places your note will read it. We never share, publish, or store the content of your prayers beyond what is needed to fulfill your request.",
  },
  {
    q: "What languages can I write my prayer in?",
    a: "You can write your prayer in any language. Our team will handwrite it exactly as you submit it, preserving your original words.",
  },
  {
    q: "Can I submit a prayer without donating?",
    a: "Yes. The donation field is optional. You can submit your prayer at no cost \u2014 donations simply help us continue offering this service.",
  },
  {
    q: "What happens with recurring donations?",
    a: "With a recurring donation (weekly, monthly, or yearly), you support our ongoing work at the Western Wall. You can submit a new prayer each time or let your original prayer remain. You can cancel or change your recurring donation at any time.",
  },
  {
    q: "How do I cancel or change my donation?",
    a: "You can manage your recurring donation through PayPal\u2019s automatic payments page, or contact us at support@westernwallnotes.com and we\u2019ll help you right away.",
  },
];

export const Donation = ({ detectedCountry }: { detectedCountry: string }) => {
  const currencyIdx = detectCurrencyIndex(detectedCountry);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prayer, setPrayer] = useState("");



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showManage, setShowManage] = useState(false);
  const [manageEmail, setManageEmail] = useState("");
  const [manageError, setManageError] = useState("");
  const [manageLoading, setManageLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState<"" | "success" | "error">("");

  const currency = CURRENCIES[currencyIdx];
  const currencySymbol = currency.symbol;
  const currencyCode = currency.code;

  const numericAmount = Number(amount) || 0;
  const isOneTime = frequency === "one-time";
  const intervalLabel = frequency === "weekly" ? "week" : frequency === "monthly" ? "month" : "year";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (amount && numericAmount < MIN_AMOUNT) {
      setError("amount");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("email");
      return;
    }
    if (!prayer.trim()) {
      setError("prayer");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          frequency,
          currency: currencyCode,
          name: name.trim(),
          email: email.trim(),
          prayer: prayer.trim(),


        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("server");
        setIsSubmitting(false);
      }
    } catch {
      setError("server");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-y-auto relative w-full h-full">
    <div className="flex flex-col gap-6 justify-center items-center min-h-full py-10 px-sides">
      <motion.div
        layout="position"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light text-center text-foreground leading-snug max-w-xl">
          Your Prayer at the Western Wall
        </h1>
      </motion.div>

      <p className="text-center text-sm sm:text-base font-serif font-light text-foreground/80 max-w-lg px-2">
        We personally place your handwritten prayer at the Western Wall and send you photo confirmation within 48 hours.
      </p>

      <div className="flex flex-col items-center w-full max-w-2xl">
        {/* Frequency toggle */}
        <div className="inline-flex rounded-full p-1 backdrop-blur-sm bg-primary/10 border border-border/30 ring-1 ring-border/10">
          {(Object.keys(frequencies) as Frequency[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setFrequency(key);
              }}
              className={cn(
                "relative px-5 py-1.5 rounded-full text-base font-serif font-light transition-colors duration-200",
                frequency === key
                  ? "text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {frequency === key && (
                <motion.div
                  layoutId="donation-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{frequencies[key].label}</span>
            </button>
          ))}
        </div>

        {/* Donation card */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 w-full backdrop-blur-xl border-2 border-border/50 bg-primary/20 rounded-3xl ring-1 ring-offset-primary/10 ring-border/10 ring-offset-2 shadow-button p-6 flex flex-col gap-5"
        >
          {/* Prayer / note */}
          <textarea
            placeholder="Write your prayer, wish, or message. It will be handwritten exactly as you write it and placed between the ancient stones of the Western Wall."
            value={prayer}
            onChange={(e) => {
              setPrayer(e.target.value);
              setError("");
            }}
            rows={8}
            className={cn(
              inputVariants(),
              "font-serif rounded-2xl resize-none h-auto py-3",
              error === "prayer" && "border-red-500/80"
            )}
          />

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={cn(
                inputVariants(),
                "font-serif rounded-2xl",
                error === "name" && "border-red-500/80"
              )}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className={cn(
                inputVariants(),
                "font-serif rounded-2xl",
                error === "email" && "border-red-500/80"
              )}
            />
          </div>

          {/* Donation amount */}
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 font-serif text-base">{currencySymbol}</span>
              <input
                type="number"
                min={MIN_AMOUNT}
                step="1"
                placeholder="Donation amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className={cn(
                  inputVariants(),
                  "font-serif pl-8 rounded-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  error === "amount" && "border-red-500/80"
                )}
              />
            </div>
            <p className="text-xs font-serif font-light text-foreground/60 mt-1.5 px-1">
              Others typically give {currencySymbol}18–{currencySymbol}36 to help us continue this service.
            </p>
          </div>

          {/* Submit + payment icons */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              size="lg"
              shine
              disabled={isSubmitting}
              className="font-serif text-base flex-1"
            >
              {isSubmitting
                ? "Redirecting..."
                : <>
                    <span className="sm:hidden">Place My Prayer</span>
                    <span className="hidden sm:inline">
                      {numericAmount
                        ? isOneTime
                          ? `Place My Prayer — ${currencySymbol}${numericAmount}`
                          : `Place My Prayer — ${currencySymbol}${numericAmount}/${intervalLabel}`
                        : "Place My Prayer"}
                    </span>
                  </>}
            </Button>
            <div className="flex items-center gap-1.5 shrink-0">
              <SiVisa className="size-8 text-foreground/50" />
              <SiMastercard className="size-7 text-foreground/50" />
              <FaCcAmex className="size-7 text-foreground/50" />
              <SiPaypal className="size-5 text-foreground/50" />
              <FaGooglePay className="size-10 text-foreground/50" />
            </div>
          </div>

          {/* Manage subscription */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setShowManage(!showManage);
                setManageError("");
              }}
              className="text-xs font-serif font-light text-foreground/60 underline underline-offset-2 hover:text-foreground/80 transition-colors"
            >
              Cancel or change your donation.
            </button>
            <div
              className={cn(
                "transition-all duration-200 ease-out",
                showManage
                  ? "max-h-40 opacity-100 overflow-visible mt-3"
                  : "max-h-0 opacity-0 overflow-hidden"
              )}
            >
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={manageEmail}
                  onChange={(e) => {
                    setManageEmail(e.target.value);
                    setManageError("");
                  }}
                  className={cn(
                    inputVariants(),
                    "font-serif text-sm",
                    manageError && "border-red-500/80"
                  )}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="iconButton"
                  disabled={manageLoading}
                  className="shrink-0 size-11"
                  onClick={async () => {
                    if (!manageEmail.trim() || !manageEmail.includes("@")) {
                      setManageError("invalid");
                      return;
                    }
                    setManageLoading(true);
                    setManageError("");
                    try {
                      const res = await fetch("/api/create-portal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: manageEmail.trim() }),
                      });
                      const data = await res.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else if (data.error === "not_found") {
                        setManageError("not_found");
                        setManageLoading(false);
                      } else {
                        setManageError("server");
                        setManageLoading(false);
                      }
                    } catch {
                      setManageError("server");
                      setManageLoading(false);
                    }
                  }}
                >
                  {manageLoading ? (
                    <span className="text-sm">...</span>
                  ) : (
                    <ArrowRightIcon className="w-4 h-4" />
                  )}
                </Button>
                </div>
              </div>
              {manageError === "not_found" && (
                <p className="text-red-400 text-xs font-serif mt-1.5">
                  No subscription found for this email.
                </p>
              )}
              {manageError === "server" && (
                <p className="text-red-400 text-xs font-serif mt-1.5">
                  Something went wrong. Please try again.
                </p>
              )}
              <p className="text-xs font-serif font-light text-foreground/60 mt-3">
                Or email{" "}
                <a
                  href="mailto:support@westernwallnotes.com"
                  className="underline underline-offset-2 hover:text-foreground/80 transition-colors"
                >
                  support@westernwallnotes.com
                </a>
                {" "}to cancel or change your donation anytime.
              </p>
            </div>
          </div>

          {/* Server error */}
          {error === "server" && (
            <p className="text-red-400 text-sm font-serif text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-2xl mt-4">
        <h2 className="text-lg sm:text-xl font-serif font-light text-center text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="backdrop-blur-xl border border-border/30 bg-primary/10 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left font-serif font-light text-sm sm:text-base text-foreground/90 hover:text-foreground transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 shrink-0 text-foreground/50 transition-transform duration-200",
                    openFaq === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "transition-all duration-200 ease-out",
                  openFaq === i
                    ? "max-h-60 opacity-100 overflow-visible"
                    : "max-h-0 opacity-0 overflow-hidden"
                )}
              >
                <p className="px-5 pb-4 text-sm font-serif font-light text-foreground/70 leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full max-w-2xl mt-4">
        <h2 className="text-lg sm:text-xl font-serif font-light text-center text-foreground mb-4">
          Contact Us
        </h2>
        <p className="text-center text-sm font-serif font-light text-foreground/70 mb-4">
          Have a question or need help? Send us a message and we'll get back to you as soon as possible.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setContactStatus("");
            if (!contactEmail.trim() || !contactEmail.includes("@")) return;
            if (!contactMessage.trim()) return;
            setContactSubmitting(true);
            try {
              const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: contactName.trim(),
                  email: contactEmail.trim(),
                  message: contactMessage.trim(),
                }),
              });
              if (res.ok) {
                setContactStatus("success");
                setContactName("");
                setContactEmail("");
                setContactMessage("");
              } else {
                setContactStatus("error");
              }
            } catch {
              setContactStatus("error");
            } finally {
              setContactSubmitting(false);
            }
          }}
          className="backdrop-blur-xl border-2 border-border/50 bg-primary/20 rounded-3xl ring-1 ring-offset-primary/10 ring-border/10 ring-offset-2 shadow-button p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={cn(inputVariants(), "font-serif rounded-2xl")}
            />
            <input
              type="email"
              placeholder="Email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={cn(inputVariants(), "font-serif rounded-2xl")}
            />
          </div>
          <textarea
            placeholder="Your message"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            rows={4}
            className={cn(
              inputVariants(),
              "font-serif rounded-2xl resize-none h-auto py-3"
            )}
          />
          <Button
            type="submit"
            size="lg"
            shine
            disabled={contactSubmitting}
            className="font-serif text-base w-full"
          >
            {contactSubmitting ? "Sending..." : "Send Message"}
          </Button>
          {contactStatus === "success" && (
            <p className="text-green-400 text-sm font-serif text-center">
              Message sent. We'll get back to you soon.
            </p>
          )}
          {contactStatus === "error" && (
            <p className="text-red-400 text-sm font-serif text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
    </div>
  );
};
