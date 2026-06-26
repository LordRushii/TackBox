import Link from "next/link";
import {
  Users,
  Rocket,
  ShieldCheck,
  Code,
  Beaker,
  Bot,
  User,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen relative overflow-hidden bg-background pb-24">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <main className="flex flex-col items-center justify-start w-full max-w-[1200px] px-6 z-10 pt-24 space-y-32">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-8">
          <div className="text-[11px] font-medium text-foreground/40 tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02]">
            ABOUT TACKBOX
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-semibold tracking-tight text-foreground leading-[1.05] max-w-4xl">
            We got tired of writing{" "}
            <br className="hidden sm:block" />
            the same instructions twice.
          </h1>

          <p className="max-w-3xl text-lg text-foreground/60 leading-relaxed">
            Most developers building AI agents spend hours writing the same prompts, instructions, and workflow logic that someone else has already figured out. That work disappears into private repos, Notion docs, and chat threads. Tackbox is a public registry for agent skills — Markdown files you can browse, download, and use in any agent framework, today.
          </p>
        </section>

        {/* Our Mission */}
        <section className="flex flex-col items-center text-center space-y-12 w-full">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl font-heading font-semibold text-foreground">
              Our Mission
            </h2>
            <p className="text-foreground/60 leading-relaxed">
              Build a shared registry of agent skills. Make proven prompts and workflows findable in under five minutes — so developers stop solving the same problem twice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
              <div className="text-foreground">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Make skills findable.
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  If someone has already solved the prompt engineering for a use case, you should be able to find and use that work in under five minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
              <div className="text-foreground">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Give developers attribution.
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Skills on Tackbox are tied to the developer who built them. Forks show the original. Quality rises when authorship is visible.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
              <div className="text-foreground">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Keep the format simple.
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  A skill is a .md file. No proprietary format, no vendor lock-in. It works wherever you can pass text to a model.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who is Tackbox for? */}
        <section className="flex flex-col items-center text-center space-y-12 w-full pt-8">
          <h2 className="text-3xl font-heading font-semibold text-foreground">
            Who is Tackbox for?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-white/[0.01] border border-white/5">
              <div className="text-foreground/80 mb-2">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">AI Engineers</h3>
              <p className="text-sm text-foreground/60">
                Building agents for production and don&apos;t have time to prompt-engineer from scratch. Browse proven skills, fork them, and adapt.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-white/[0.01] border border-white/5">
              <div className="text-foreground/80 mb-2">
                <Beaker className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">Indie Hackers</h3>
              <p className="text-sm text-foreground/60">
                You&apos;ve built something that works. Publish the skill behind it. Let others use it, and let them find you through your work.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-white/[0.01] border border-white/5">
              <div className="text-foreground/80 mb-2">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">Automation Teams</h3>
              <p className="text-sm text-foreground/60">
                Your team writes the same instructions in five different tools. Centralize them as skills. Version them. Share the link instead of the Notion page.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-white/[0.01] border border-white/5">
              <div className="text-foreground/80 mb-2">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">AI Tooling Developers</h3>
              <p className="text-sm text-foreground/60">
                Building on top of models and want to give users a head start. Point them at Tackbox instead of writing a prompt library from scratch.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full">
          <div className="relative rounded-lg overflow-hidden bg-white/[0.02] border border-white/10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between text-left shadow-2xl shadow-black">
            <div className="flex items-center gap-6 z-10 mb-8 md:mb-0">
              <div className="hidden md:flex w-16 h-16 items-center justify-center rounded-lg bg-[#0A0A0A] border border-white/10 text-foreground shadow-sm">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
                  Start with a skill someone else already built.
                </h2>
                <p className="text-foreground/60 font-medium max-w-md">
                  Browse the registry. Download a .md file. Ship your agent faster.
                </p>
              </div>
            </div>

            <div className="z-10 w-full md:w-auto">
              <Link
                href="/skills"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-white text-[#0A0A0A] hover:bg-white/90 font-medium transition-colors w-full md:w-auto text-sm gap-2"
              >
                Browse Skills <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
