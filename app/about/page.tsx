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
    <div className="flex flex-col items-center justify-start min-h-screen relative overflow-hidden bg-base-100 pb-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

      <main className="flex flex-col items-center justify-start w-full max-w-5xl px-6 z-10 pt-24 space-y-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="text-xs font-bold text-base-content/50 tracking-widest uppercase px-4 py-1 rounded-full bg-base-200/30 border border-base-200">
            ABOUT TACKBOX
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight max-w-3xl">
            We got tired of writing{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              the same instructions twice.
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-base-content/60 leading-relaxed font-medium">
            Most developers building AI agents spend hours writing the same prompts, instructions, and workflow logic that someone else has already figured out. That work disappears into private repos, Notion docs, and chat threads. Tackbox is a public registry for agent skills — Markdown files you can browse, download, and use in any agent framework, today.
          </p>
        </section>

        {/* Our Mission */}
        <section className="flex flex-col items-center text-center space-y-12 w-full">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl font-bold text-base-content">
              Our Mission
            </h2>
            <p className="text-base-content/60 leading-relaxed">
              Build a shared registry of agent skills. Make proven prompts and workflows findable in under five minutes — so developers stop solving the same problem twice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content mb-2">
                  Make skills findable.
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  If someone has already solved the prompt engineering for a use case, you should be able to find and use that work in under five minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content mb-2">
                  Give developers attribution.
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  Skills on Tackbox are tied to the developer who built them. Forks show the original. Quality rises when authorship is visible.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content mb-2">
                  Keep the format simple.
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  A skill is a .md file. No proprietary format, no vendor lock-in. It works wherever you can pass text to a model.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who is Tackbox for? */}
        <section className="flex flex-col items-center text-center space-y-12 w-full pt-8">
          <h2 className="text-3xl font-bold text-base-content">
            Who is Tackbox for?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-primary mb-2 shadow-sm">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">AI Engineers</h3>
              <p className="text-sm text-base-content/60">
                Building agents for production and don&apos;t have time to prompt-engineer from scratch. Browse proven skills, fork them, and adapt.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-indigo-500 mb-2 shadow-sm">
                <Beaker className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">Indie Hackers</h3>
              <p className="text-sm text-base-content/60">
                You&apos;ve built something that works. Publish the skill behind it. Let others use it, and let them find you through your work.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-emerald-500 mb-2 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">Automation Teams</h3>
              <p className="text-sm text-base-content/60">
                Your team writes the same instructions in five different tools. Centralize them as skills. Version them. Share the link instead of the Notion page.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-secondary mb-2 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">AI Tooling Developers</h3>
              <p className="text-sm text-base-content/60">
                Building on top of models and want to give users a head start. Point them at Tackbox instead of writing a prompt library from scratch.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full">
          <div className="relative rounded-3xl overflow-hidden bg-base-200 border border-white/[0.06] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between text-left shadow-xl">
            <div className="flex items-center gap-6 z-10 mb-8 md:mb-0">
              <div className="hidden md:flex w-16 h-16 items-center justify-center rounded-2xl bg-base-100 border border-white/[0.06] text-primary shadow-md">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Start with a skill someone else already built.
                </h2>
                <p className="text-white/60 font-medium max-w-md">
                  Browse the registry. Download a .md file. Ship your agent faster.
                </p>
              </div>
            </div>

            <div className="z-10 w-full md:w-auto">
              <Link
                href="/my-skills"
                className="btn bg-white text-base-100 hover:bg-white/90 border-0 rounded-xl px-8 h-14 font-bold shadow-md w-full md:w-auto text-base flex items-center gap-2"
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
