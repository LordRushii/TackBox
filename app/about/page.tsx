import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, Code, Hammer, Wrench } from "lucide-react";
import { ABOUT } from "@/lib/site-copy";
import { installCommands, registryRepo, repoUrl } from "@/features/registry/repo";
import HeroBackdrop from "@/components/landing/HeroBackdrop";
import Reveal from "@/components/landing/Reveal";

export const metadata = {
  title: "About · Tackbox",
  description: "Why Tackbox exists, what a skill file contains, and who builds it.",
};

const AUDIENCE_ICONS = [Code, Hammer, Bot, Wrench];

// Three bands of a skill file, matched to the anatomy list by index
const ANATOMY_LINES: { band: number; text: React.ReactNode }[] = [
  { band: 0, text: <span className="text-muted">---</span> },
  { band: 0, text: <><span className="text-amber">name:</span> <span className="text-foreground">code-reviewer</span></> },
  { band: 0, text: <><span className="text-amber">description:</span> <span className="text-foreground">Reviews code before merge</span></> },
  { band: 0, text: <><span className="text-amber">mode:</span> <span className="text-foreground">subagent</span></> },
  { band: 0, text: <><span className="text-amber">temperature:</span> <span className="text-foreground">0.1</span></> },
  { band: 0, text: <span className="text-muted">---</span> },
  { band: 1, text: <span className="text-subtle">You are a code reviewer. Give actionable,</span> },
  { band: 1, text: <span className="text-subtle">prioritized feedback on code changes.</span> },
  { band: 1, text: <><span className="text-amber">## </span><span className="text-foreground">Review scope</span></> },
  { band: 1, text: <span className="text-subtle">1. Bugs, security and auth problems</span> },
];

const sectionTitle =
  "font-heading text-[32px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[40px]";

export default function AboutPage() {
  const { owner, repo } = registryRepo();

  return (
    <div className="flex w-full flex-col items-center bg-background pb-32">
      {/* Hero */}
      <section className="relative isolate -mt-16 w-full overflow-hidden pt-16">
        <div className="relative">
          <HeroBackdrop />
          <div className="relative mx-auto flex max-w-[1200px] items-end justify-between gap-12 px-6 pb-36 pt-24 sm:pb-44 sm:pt-32">
            <div className="flex flex-col">
              <Reveal>
                <p className="flex h-8 w-fit items-center gap-2 rounded-lg border border-line bg-background/80 px-3 text-[13px] text-subtle">
                  <span className="size-1.5 bg-amber" />
                  {ABOUT.eyebrow}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-7 max-w-4xl font-heading text-[40px] font-medium leading-[1.04] tracking-[-0.035em] text-foreground sm:text-[64px] lg:text-[76px]">
                  {ABOUT.headline[0]}
                  <span className="block text-subtle">{ABOUT.headline[1]}</span>
                </h1>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <main className="flex w-full max-w-[1200px] flex-col gap-32 px-6 pt-24">
        {/* Origin story */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
          <Reveal>
            <p className="font-mono text-xs text-amber md:sticky md:top-28">Why it exists</p>
          </Reveal>
          <div className="flex max-w-[44rem] flex-col gap-6">
            {ABOUT.intro.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p
                  className={
                    i === 0
                      ? "font-heading text-[22px] leading-[34px] tracking-[-0.01em] text-foreground sm:text-[26px] sm:leading-[38px]"
                      : "text-[17px] leading-[29px] text-subtle"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Anatomy of a skill file */}
        <section>
          <Reveal>
            <h2 className={sectionTitle}>{ABOUT.anatomyTitle}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
            <Reveal className="overflow-hidden rounded-2xl border border-line bg-deep">
              <div className="flex h-11 items-center border-b border-line px-4 font-mono text-xs text-muted">
                skills/code-reviewer/<span className="text-foreground">SKILL.md</span>
              </div>
              <div className="py-4 font-mono text-[12.5px] leading-[22px] sm:text-[13px]">
                {ANATOMY_LINES.map((line, i) => (
                  <div
                    key={i}
                    className={`flex border-l-2 ${line.band === 0 ? "border-amber/70 bg-amber/[0.04]" : "border-line-strong bg-card"}`}
                  >
                    <span className="w-11 shrink-0 select-none pr-4 text-right tabular-nums text-muted/60">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre pr-6">{line.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex h-12 items-center gap-3 border-l-2 border-t border-l-amber/30 border-t-line bg-card px-4 font-mono text-xs text-subtle">
                <span className="text-amber">$</span>
                <span className="truncate">
                  {installCommands("code-reviewer").cli}
                </span>
              </div>
            </Reveal>

            <ol className="flex flex-col">
              {ABOUT.anatomy.map((part, i) => (
                <li key={part.label} className="border-t border-line py-6 first:border-t-0 first:pt-0 lg:first:pt-2">
                  <Reveal delay={i * 0.08}>
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-amber">0{i + 1}</span>
                      <div>
                        <h3 className="font-heading text-lg font-medium text-foreground">{part.label}</h3>
                        <p className="mt-2 text-[15px] leading-[24px] text-subtle">{part.body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Principles */}
        <section>
          <Reveal>
            <h2 className={sectionTitle}>{ABOUT.principlesTitle}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {ABOUT.principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08} className="bg-background p-7 sm:p-8">
                <span className="font-heading text-[56px] font-medium leading-none tracking-[-0.04em] text-muted">
                  {i + 1}
                </span>
                <h3 className="mt-8 font-heading text-xl font-medium text-foreground">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-[24px] text-subtle">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Audiences */}
        <section>
          <Reveal>
            <h2 className={sectionTitle}>{ABOUT.audienceTitle}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ABOUT.audiences.map((a, i) => {
              const Icon = AUDIENCE_ICONS[i];
              return (
                <Reveal
                  key={a.title}
                  delay={(i % 2) * 0.06}
                  className="rounded-2xl border border-line bg-card p-7 transition-colors duration-200 ease-out hover:border-line-strong"
                >
                  <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised">
                    <Icon className="size-4 text-amber" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-6 font-heading text-lg font-medium text-foreground">{a.title}</h3>
                  <p className="mt-2 text-[15px] leading-[24px] text-subtle">{a.body}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Roadmap and builder */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Reveal className="rounded-2xl border border-line bg-card p-7 sm:p-8">
            <h2 className="font-heading text-2xl font-medium text-foreground">{ABOUT.roadmapTitle}</h2>
            <p className="mt-2 text-[15px] leading-[24px] text-subtle">{ABOUT.roadmapNote}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {ABOUT.roadmap.map((item) => (
                <li
                  key={item}
                  className="flex h-9 items-center rounded-lg border border-dashed border-line-strong px-3.5 text-[13px] text-subtle"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06} className="flex flex-col rounded-2xl border border-line bg-card p-7 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-amber font-heading text-sm font-semibold text-amber-ink">
                RJ
              </span>
              <h2 className="font-heading text-2xl font-medium text-foreground">{ABOUT.builder.title}</h2>
            </div>
            <p className="mt-4 text-[15px] leading-[24px] text-subtle">{ABOUT.builder.body}</p>
            <a
              href={repoUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-auto flex items-center gap-1.5 pt-6 text-sm text-foreground transition-colors duration-150 ease-out hover:text-amber"
            >
              {owner}/{repo} on GitHub <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </a>
          </Reveal>
        </section>

        {/* CTA */}
        <Reveal>
          <section className="relative overflow-hidden rounded-[20px] border border-line bg-card px-8 py-16 sm:px-14 sm:py-20">
            <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-[30px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-[40px]">
                  {ABOUT.cta.title}
                </h2>
                <p className="mt-3 max-w-md text-lg leading-[28px] text-subtle">{ABOUT.cta.body}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/my-skills" className="btn btn-primary h-11 gap-2 px-5 text-sm">
                  {ABOUT.cta.primary} <ArrowRight className="size-4" strokeWidth={1.5} />
                </Link>
                <Link
                  href="/skills"
                  className="btn h-11 border border-line bg-raised px-5 text-sm text-foreground hover:border-line-strong hover:bg-raised-strong"
                >
                  {ABOUT.cta.secondary}
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
    </div>
  );
}
