"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Container,
  GitCommitHorizontal,
  Globe,
  Layers,
  Lock,
  MessagesSquare,
  PanelsTopLeft,
  PenTool,
  Server,
  Terminal,
} from "lucide-react";
import { fetchStatsAction } from "@/features/skills/actions";
import { installCommands } from "@/features/registry/repo";
import { HOME } from "@/lib/site-copy";
import { useViewer } from "@/features/auth/viewer";
import HeroBackdrop from "@/components/landing/HeroBackdrop";
import SkillWindow from "@/components/landing/SkillWindow";
import Marquee from "@/components/landing/Marquee";
import Reveal from "@/components/landing/Reveal";
import PixelC from "@/components/pixel/PixelC";

type Stats = { totalSkills: number; totalUsers: number; totalDownloads: number };

const CATEGORIES = [
  { icon: PanelsTopLeft, label: "Frontend" },
  { icon: Server, label: "Backend" },
  { icon: Layers, label: "Fullstack" },
  { icon: Container, label: "DevOps" },
  { icon: PenTool, label: "Design" },
  { icon: MessagesSquare, label: "Soft Skills" },
];

const ease = [0.22, 1, 0.36, 1] as const;
const formatCount = (n: number) => n.toLocaleString("en-US");

export default function Home() {
  const isLoggedIn = useViewer() !== null;
  // undefined while loading, null if the stats query failed
  const [stats, setStats] = useState<Stats | null | undefined>(undefined);

  const installCommand = installCommands("code-reviewer").cli;
  const publishHref = isLoggedIn ? "/my-skills" : "/login";

  useEffect(() => {
    fetchStatsAction().then(setStats);
  }, []);

  const statItems = [
    { label: "Skills", value: stats?.totalSkills },
    { label: "Developers", value: stats?.totalUsers },
    { label: "Downloads", value: stats?.totalDownloads },
  ];

  return (
    <div className="flex w-full flex-col items-center bg-background">
      <Hero installCommand={installCommand} publishHref={publishHref} />

      {/* Stats and the skill strip */}
      <section className="w-full max-w-[1200px] px-6 pt-14">
        <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between">
          {stats !== null && (
            <dl className="flex gap-10 sm:gap-14">
              {statItems.map((s) => (
                <div key={s.label} className="flex flex-col gap-1.5">
                  <dt className="text-[13px] text-muted">{s.label}</dt>
                  <dd className="font-heading text-[28px] font-medium leading-none tabular-nums text-foreground">
                    {s.value === undefined ? <span className="text-muted">-</span> : formatCount(s.value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-sm text-muted">{HOME.hero.marqueeLabel}</p>
        </div>
        <div className="mt-8">
          <Marquee items={[...HOME.hero.marqueeSkills]} />
        </div>
      </section>

      <main className="flex w-full max-w-[1200px] flex-col gap-32 px-6 pb-32 pt-32">
        {/* How it works */}
        <section>
          <Reveal>
            <h2 className="font-heading text-[32px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[40px]">
              {HOME.howItWorks.title}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {HOME.howItWorks.steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="flex flex-col bg-background p-7 sm:p-8">
                <span className="font-mono text-xs text-amber">0{i + 1}</span>
                <h3 className="mt-6 font-heading text-xl font-medium text-foreground">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-[24px] text-subtle">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bento */}
        <section>
          <Reveal className="max-w-2xl">
            <h2 className="font-heading text-[32px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[40px]">
              {HOME.bento.title}
            </h2>
            <p className="mt-4 text-lg leading-[28px] text-subtle">{HOME.bento.subtitle}</p>
          </Reveal>
          <Bento />
        </section>

        {/* Categories */}
        <section id="categories" className="scroll-mt-24">
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="font-heading text-[32px] font-medium leading-tight tracking-[-0.02em] text-foreground">
              {HOME.categoriesTitle}
            </h2>
            <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/skills?category=${encodeURIComponent(cat.label)}`}
                  className="group flex h-14 items-center justify-between rounded-xl border border-line bg-card px-4 text-sm text-subtle transition-colors duration-150 ease-out hover:border-line-strong hover:bg-raised hover:text-foreground"
                >
                  <span className="flex items-center gap-2.5">
                    <cat.icon
                      className="size-4 text-muted transition-colors duration-150 ease-out group-hover:text-amber"
                      strokeWidth={1.5}
                    />
                    {cat.label}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Final CTA */}
        <Reveal>
          <section className="flex flex-col gap-12 overflow-hidden rounded-[20px] border border-line bg-card px-8 py-14 sm:px-14 sm:py-16 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-start">
              <h2 className="font-heading text-[32px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[44px]">
                {HOME.finalCta.title}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-[28px] text-subtle">{HOME.finalCta.body}</p>
              <Link href={publishHref} className="btn btn-primary mt-8 h-11 gap-2 px-5 text-sm">
                {HOME.finalCta.button} <ArrowRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>
            <PixelC tile={18} gap={4} className="self-center md:mr-4" />
          </section>
        </Reveal>
      </main>
    </div>
  );
}

function Hero({ installCommand, publishHref }: { installCommand: string; publishHref: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // The window starts tilted back and settles flat as you scroll into it
  const rotateX = useTransform(scrollYProgress, [0, 0.45], reduce ? [0, 0] : [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], reduce ? [1, 1] : [0.94, 1]);
  const { hero } = HOME;

  return (
    <section ref={ref} className="relative isolate -mt-16 w-full overflow-hidden pt-16">
      <div className="relative">
        <HeroBackdrop className="h-[620px] sm:h-[740px]" calm="center" />

        <div className="relative flex flex-col items-center px-6 pt-20 text-center sm:pt-28">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex h-8 items-center gap-2 rounded-lg border border-line bg-background/80 px-3 text-[13px] text-subtle"
          >
            <span className="size-1.5 bg-amber" />
            {hero.eyebrow}
          </motion.p>

          <h1 className="mt-7 max-w-5xl font-heading text-[42px] font-medium leading-[1.02] tracking-[-0.035em] text-foreground sm:text-[68px] lg:text-[84px]">
            {hero.headline.map((line, i) => (
              <motion.span
                key={line}
                className={`block ${i === 1 ? "text-subtle" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.08 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-7 max-w-[34rem] text-[17px] leading-[28px] text-subtle sm:text-lg"
          >
            {hero.subhead}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <Link href="/skills" className="btn btn-primary h-11 w-full gap-2 px-5 text-sm sm:w-auto">
              {hero.primaryCta} <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            <Link
              href={publishHref}
              className="btn h-11 w-full border border-line bg-background/80 px-5 text-sm text-foreground hover:border-line-strong hover:bg-raised sm:w-auto"
            >
              {hero.secondaryCta}
            </Link>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-16 flex items-center gap-2 text-[13px] text-muted"
          >
            <Terminal className="size-3.5" strokeWidth={1.5} />
            {hero.installCaption}
          </motion.p>

          {/* Product shot, cropped by the bottom edge of the panel */}
          <div className="mt-5 w-full max-w-[780px] pb-4 [perspective:1400px]">
            <motion.div
              style={{ rotateX, scale, transformOrigin: "50% 100%" }}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease }}
              className="text-left"
            >
              <SkillWindow installCommand={installCommand} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bento() {
  const [markdown, install, git, visibility] = HOME.bento.cards;
  const card =
    "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-colors duration-200 ease-out hover:border-line-strong";

  return (
    <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
      {/* Plain Markdown */}
      <Reveal className={`${card} md:col-span-4`}>
        <div className="flex-1 border-b border-line bg-deep/60 p-6 font-mono text-[12.5px] leading-[22px]">
          <span className="text-muted">---</span>
          <br />
          <span className="text-amber">name:</span> <span className="text-foreground">accessibility-audit</span>
          <br />
          <span className="text-amber">description:</span>{" "}
          <span className="text-foreground">Checks components against WCAG 2.2</span>
          <br />
          <span className="text-amber">mode:</span> <span className="text-foreground">subagent</span>
          <br />
          <span className="text-muted">---</span>
          <br />
          <span className="text-subtle">Audit every interactive element for a visible focus state...</span>
        </div>
        <CardText title={markdown.title} body={markdown.body} />
      </Reveal>

      {/* Install */}
      <Reveal delay={0.06} className={`${card} md:col-span-2`}>
        <div className="flex flex-1 flex-col justify-center gap-2 border-b border-line bg-deep/60 p-6 font-mono text-[12px]">
          <div className="flex items-center gap-2 text-subtle">
            <span className="text-amber">$</span> npx skills add
          </div>
          <div className="text-muted">resolving skills/code-reviewer</div>
          <div className="text-muted">writing SKILL.md</div>
          <div className="text-foreground">done in 1.2s</div>
        </div>
        <CardText title={install.title} body={install.body} />
      </Reveal>

      {/* Git */}
      <Reveal delay={0.06} className={`${card} md:col-span-3`}>
        <ul className="flex flex-1 flex-col gap-3 border-b border-line bg-deep/60 p-6 font-mono text-[12px]">
          {[
            ["a41f9c2", "add skills/code-reviewer"],
            ["7be03d1", "update description"],
            ["e5c218a", "tighten review scope"],
          ].map(([sha, msg]) => (
            <li key={sha} className="flex items-center gap-3">
              <GitCommitHorizontal className="size-4 shrink-0 text-amber" strokeWidth={1.5} />
              <span className="text-muted">{sha}</span>
              <span className="truncate text-subtle">{msg}</span>
            </li>
          ))}
        </ul>
        <CardText title={git.title} body={git.body} />
      </Reveal>

      {/* Visibility */}
      <Reveal delay={0.12} className={`${card} md:col-span-3`}>
        <div className="flex flex-1 items-center gap-3 border-b border-line bg-deep/60 p-6">
          <span className="flex h-9 items-center gap-2 rounded-lg border border-amber/30 bg-amber/10 px-3 text-xs text-amber">
            <Globe className="size-3.5" strokeWidth={1.75} /> Public
          </span>
          <span className="flex h-9 items-center gap-2 rounded-lg border border-line bg-raised px-3 text-xs text-subtle">
            <Lock className="size-3.5" strokeWidth={1.75} /> Private
          </span>
          <span className="ml-auto truncate text-xs text-muted">by @LordRushii</span>
        </div>
        <CardText title={visibility.title} body={visibility.body} />
      </Reveal>
    </div>
  );
}

function CardText({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6">
      <h3 className="font-heading text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-[22px] text-subtle">{body}</p>
    </div>
  );
}
