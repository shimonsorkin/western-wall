"use client";

import { Form, FormControl, FormField, FormItem } from "./ui/form";
import type { NewsletterSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema } from "@/lib/schema";
import { subscribe } from "@/lib/subscribe";
import { useEffect, useState } from "react";
import { ActionResult, cn } from "@/lib/utils";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { inputVariants } from "./ui/input";
import { AnimatePresence, motion } from "framer-motion";

const SPRING = {
  type: "spring" as const,
  stiffness: 130.40,
  damping: 14.50,
  mass: 1,
};

const getDefaultValues = () => {
  if (typeof window !== 'undefined') {
    const email = localStorage.getItem('email');
    return { email: email || '' };
  }

  return { email: '' };
}

export const FormNewsletter = ({
  input,
  submit,
  newsletterTag,
}: {
  input: (props: React.ComponentProps<"input">) => React.ReactNode;
  submit: (props: React.ComponentProps<"button">) => React.ReactNode;
  newsletterTag: string;
}) => {
  const [submissionState, setSubmissionState] =
    useState<ActionResult<string> | null>(null);

  const form = useForm<NewsletterSchema>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: getDefaultValues()
  });

  useEffect(() => {
    return () => {
      const v = form.getValues('email');

      if (v != undefined) {
        localStorage.setItem('email', v);
      }
    }
  }, [form]);

  async function onSubmit(values: NewsletterSchema) {
    const state = await subscribe(values.email, newsletterTag);

    setSubmissionState(state);

    if (state.success === true) {
      form.reset({ email: '' });
    }

    if (state.success === false) {
      form.setError("email", { message: state.message });
    }
  }

  const isSuccess = submissionState?.success === true;
  const hasError = !!form.formState.errors.email;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative pt-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <div className={cn(
                  "relative [&_input]:transition-colors [&_input]:duration-300",
                  hasError && "[&_input]:border-red-500/80"
                )}>
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={SPRING}
                        className={cn(
                          inputVariants(),
                          "font-serif flex items-center justify-center gap-2 text-green-400 border-green-400/50 cursor-default"
                        )}
                        onClick={() => setSubmissionState(null)}
                      >
                        <CheckCircledIcon className="size-4" />
                        <span>{submissionState.data}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={SPRING}
                      >
                        {input({ ...field })}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                          {submit({
                            type: "submit",
                            disabled: form.formState.isSubmitting,
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
