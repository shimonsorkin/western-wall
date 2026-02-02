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
import { ArrowRightIcon } from "@radix-ui/react-icons";

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
  monthly: { label: "Monthly", interval: "month" },
  annual: { label: "Annual", interval: "year" },
} as const;

type Frequency = keyof typeof frequencies;

const PRESET_AMOUNTS: Record<Frequency, readonly number[]> = {
  "one-time": [25, 50, 100],
  monthly: [10, 15, 30],
  annual: [50, 100, 250],
};

export const Donation = ({ detectedCountry }: { detectedCountry: string }) => {
  const currencyIdx = detectCurrencyIndex(detectedCountry);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number>(15);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("500");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showManage, setShowManage] = useState(false);
  const [manageEmail, setManageEmail] = useState("");
  const [manageError, setManageError] = useState("");
  const [manageLoading, setManageLoading] = useState(false);

  const currency = CURRENCIES[currencyIdx];
  const currencySymbol = currency.symbol;
  const currencyCode = currency.code;

  const amount = isCustom ? Number(customAmount) || 0 : selectedAmount;
  const isOneTime = frequency === "one-time";
  const intervalLabel = frequency === "monthly" ? "month" : "year";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!amount || amount < 1) {
      setError("amount");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("email");
      return;
    }
    if (!agreedToPrivacy) {
      setError("privacy");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          frequency,
          currency: currencyCode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
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
        <img
          src="/logo_tmt.svg"
          alt="The Moscow Times"
          className="h-16 sm:h-20 lg:h-24 w-auto"
        />
      </motion.div>

      <p className="text-center text-sm sm:text-base font-serif font-light text-foreground/80 max-w-lg px-2">
        The Moscow Times is Russia&apos;s oldest independent media outlet. We publish in both English and Russian—and your support helps us bring the truth to Russians who need it most. <span className="font-bold">Cancel any time.</span>
      </p>

      <div className="flex flex-col items-center w-full max-w-lg">
        {/* Frequency toggle */}
        <div className="inline-flex rounded-full p-1 backdrop-blur-sm bg-primary/10 border border-border/30 ring-1 ring-border/10">
          {(Object.keys(frequencies) as Frequency[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setFrequency(key);
                setSelectedAmount(PRESET_AMOUNTS[key][1]);
                setIsCustom(false);
                setCustomAmount("500");
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
          {/* Amount selector */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS[frequency].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setSelectedAmount(a);
                  setIsCustom(false);
                  setError("");
                }}
                className={cn(
                  "relative rounded-full py-2.5 text-base font-serif font-light transition-colors duration-200 border",
                  !isCustom && selectedAmount === a
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 text-foreground/70 hover:text-foreground border-border/30 hover:border-border/50"
                )}
              >
                {currencySymbol}{a}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
                setError("");
              }}
              className={cn(
                "relative rounded-full py-2.5 text-base font-serif font-light transition-colors duration-200 border",
                isCustom
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/10 text-foreground/70 hover:text-foreground border-border/30 hover:border-border/50"
              )}
            >
              Other
            </button>
          </div>

          {/* Custom amount input */}
          <div
            className={cn(
              "transition-all duration-200 ease-out",
              isCustom
                ? "max-h-16 opacity-100 overflow-visible"
                : "max-h-0 opacity-0 overflow-hidden"
            )}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 font-serif text-base">{currencySymbol}</span>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setError("");
                }}
                className={cn(
                  inputVariants(),
                  "font-serif pl-8 rounded-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  error === "amount" && "border-red-500/80"
                )}
              />
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError("");
              }}
              className={cn(
                inputVariants(),
                "font-serif rounded-2xl",
                error === "name" && !firstName.trim() && "border-red-500/80"
              )}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setError("");
              }}
              className={cn(
                inputVariants(),
                "font-serif rounded-2xl",
                error === "name" && !lastName.trim() && "border-red-500/80"
              )}
            />
          </div>

          {/* Email */}
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

          {/* Privacy checkbox */}
          <label
            className={cn(
              "flex items-center gap-3 cursor-pointer font-serif text-sm font-light text-foreground/80 transition-colors",
              error === "privacy" && "text-red-400"
            )}
          >
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => {
                setAgreedToPrivacy(e.target.checked);
                setError("");
              }}
              className="size-4 rounded accent-primary"
            />
            <span>
              I agree to the{" "}
              <a
                href="https://www.themoscowtimes.com/page/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                privacy policy
              </a>
              .
            </span>
          </label>

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
                    <span className="sm:hidden">Support</span>
                    <span className="hidden sm:inline">
                      {isOneTime
                        ? `Support with ${currencySymbol}${amount}`
                        : `Support with ${currencySymbol}${amount}/${intervalLabel}`}
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
                  href="mailto:support@themoscowtimes.com"
                  className="underline underline-offset-2 hover:text-foreground/80 transition-colors"
                >
                  support@themoscowtimes.com
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
    </div>
    </div>
  );
};
