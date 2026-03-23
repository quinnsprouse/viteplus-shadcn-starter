import { MeshGradient } from "@paper-design/shaders-react";
import { createFileRoute } from "@tanstack/react-router";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

import { Icon, Github01Icon, ArrowRight01Icon } from "@/components/icons";
import { Snippet } from "@/components/ui/snippet";

export const Route = createFileRoute("/")({
  component: Home,
});

const tools = [
  { name: "Vite+", href: "https://viteplus.dev", desc: "Unified toolchain" },
  { name: "TanStack Start", href: "https://tanstack.com/start", desc: "Full-stack framework" },
  { name: "React 19", href: "https://react.dev", desc: "UI library" },
  { name: "Tailwind v4", href: "https://tailwindcss.com", desc: "Utility CSS" },
  { name: "shadcn/ui", href: "https://ui.shadcn.com", desc: "Component system" },
  { name: "Motion", href: "https://motion.dev", desc: "Animation" },
  { name: "Nitro", href: "https://nitro.build", desc: "Server engine" },
];

function VitePlusLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="46"
      fill="none"
      viewBox="0 0 48 46"
      className={className}
    >
      <path
        fill="currentColor"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
    </svg>
  );
}

function Home() {
  const prefersReducedMotion = useReducedMotion();
  const skip = !!prefersReducedMotion;

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 selection:bg-[#863bff]/20">
        {/* Shader background */}
        <MeshGradient
          colors={["#f5f0ff", "#f0f4ff", "#faf5ff", "#f5f5f5"]}
          speed={0.08}
          distortion={0.3}
          swirl={0.15}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 w-full max-w-lg">
          {/* Logo + badge */}
          <m.div
            className="mb-10 flex items-center gap-3"
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#863bff] text-white shadow-[0_0_24px_rgba(134,59,255,0.3)]">
              <VitePlusLogo className="size-5" />
            </div>
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              Starter Kit
            </span>
          </m.div>

          {/* Headline */}
          <m.h1
            className="text-[clamp(2rem,5vw,3rem)] leading-[1.08] font-bold tracking-[-0.035em] text-foreground"
            initial={skip ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            Build faster
            <br />
            with the unified
            <br />
            <span className="text-[#863bff]">toolchain.</span>
          </m.h1>

          {/* Description */}
          <m.p
            className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground"
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            A type-safe, agent-ready foundation combining Vite+, TanStack Start, and shadcn/ui into
            one cohesive stack.
          </m.p>

          {/* Actions */}
          <m.div
            className="mt-8 space-y-3"
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Snippet
              text="npx degit quinnsprouse/viteplus-shadcn-starter my-app"
              className="w-full"
            />

            <div className="flex items-center gap-4 pt-1">
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
                Documentation
              </a>
            </div>
          </m.div>

          {/* Stack grid */}
          <m.div
            className="mt-14 border-t border-border/60 pt-8"
            initial={skip ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="mb-4 font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
              What's included
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              {tools.map((tool, i) => (
                <m.a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                  initial={skip ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.55 + i * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <span className="block text-[13px] font-medium text-foreground transition-colors group-hover:text-[#863bff]">
                    {tool.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/60">{tool.desc}</span>
                </m.a>
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
