import { createFileRoute } from "@tanstack/react-router";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useState } from "react";
import { TextMorph } from "torph/react";

import { Icon, Github01Icon, ArrowRight01Icon, ShadcnIcon } from "@/components/icons";
import { Snippet } from "@/components/ui/snippet";
import { useMountEffect } from "@/hooks/use-mount-effect";

export const Route = createFileRoute("/")({
  component: Home,
});

const rotatingWords = ["agents.", "humans.", "teams.", "you."];

const guardrails = [
  { label: "No useEffect", detail: "Lint-enforced, useMountEffect only" },
  { label: "Progressive docs", detail: "Agents load context on demand" },
  { label: "Quality gates", detail: "Pre-commit and pre-push hooks" },
  { label: "Type-safe routing", detail: "TanStack Router + Start" },
  { label: "Zero-config lint", detail: "oxlint + TanStack plugins" },
  { label: "Dead code detection", detail: "Knip catches unused exports" },
];

const stack = [
  { name: "Vite+", href: "https://viteplus.dev" },
  { name: "TanStack Start", href: "https://tanstack.com/start" },
  { name: "React 19", href: "https://react.dev" },
  { name: "Tailwind v4", href: "https://tailwindcss.com" },
  { name: "shadcn/ui", href: "https://ui.shadcn.com" },
  { name: "Nitro", href: "https://nitro.build" },
];

function useRotatingWord(words: string[], intervalMs = 2000) {
  const [index, setIndex] = useState(0);

  useMountEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  });

  return words[index];
}

function Home() {
  const prefersReducedMotion = useReducedMotion();
  const skip = !!prefersReducedMotion;
  const currentWord = useRotatingWord(rotatingWords, 2500);

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex min-h-dvh flex-col justify-between bg-white px-6 pt-32 pb-10 selection:bg-[#863bff]/20 sm:px-10">
        {/* Hero section */}
        <div className="mx-auto w-full max-w-xl">
          {/* Stack pill */}
          <m.div
            className="mb-8 flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5"
            initial={skip ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <a
              href="https://viteplus.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 48 46"
                aria-hidden="true"
              >
                <path
                  fill="#863bff"
                  d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
                />
              </svg>
              Vite+
            </a>
            <span className="text-muted-foreground/30" aria-hidden="true">
              +
            </span>
            <a
              href="https://tanstack.com/start"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              TanStack
            </a>
            <span className="text-muted-foreground/30" aria-hidden="true">
              +
            </span>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              <Icon icon={ShadcnIcon} className="size-3" aria-hidden="true" />
              shadcn
            </a>
          </m.div>

          {/* Headline */}
          <m.h1
            className="text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-bold tracking-[-0.04em] text-foreground"
            initial={skip ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Built for{" "}
            <TextMorph as="span" className="text-[#863bff]" duration={600} respectReducedMotion>
              {currentWord}
            </TextMorph>
          </m.h1>

          {/* Description */}
          <m.p
            className="mt-4 max-w-sm text-[15px] leading-[1.65] text-muted-foreground"
            initial={skip ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            A full-stack React starter with guardrails that keep AI agents — and developers —
            writing correct code by default.
          </m.p>

          {/* Actions */}
          <m.div
            className="mt-10"
            initial={skip ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Snippet
              text="npx degit quinnsprouse/viteplus-shadcn-starter my-app"
              className="w-full"
            />

            <div className="mt-4 flex items-center gap-5">
              <a
                href="https://github.com/quinnsprouse/viteplus-shadcn-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-[#863bff]"
              >
                <Icon icon={Github01Icon} className="size-4" aria-hidden="true" />
                GitHub
                <Icon
                  icon={ArrowRight01Icon}
                  className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://viteplus.dev/guide/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Docs
              </a>
            </div>
          </m.div>

          {/* Guardrails */}
          <m.div
            className="mt-20"
            initial={skip ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <p className="mb-5 font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase">
              Agent guardrails
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
              {guardrails.map((g, i) => (
                <m.div
                  key={g.label}
                  initial={skip ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.4 + i * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <span className="block text-[13px] font-medium text-foreground">{g.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground/50">
                    {g.detail}
                  </span>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>

        {/* Footer stack */}
        <m.div
          className="mx-auto mt-20 flex w-full max-w-xl flex-wrap items-center gap-x-1.5 gap-y-1"
          initial={skip ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {stack.map((s, i) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground/40 transition-colors hover:text-foreground"
            >
              {s.name}
              {i < stack.length - 1 && (
                <span className="ml-1.5 text-muted-foreground/25" aria-hidden="true">
                  /
                </span>
              )}
            </a>
          ))}
        </m.div>
      </div>
    </LazyMotion>
  );
}
