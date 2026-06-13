import Link from "next/link";
import { Users, Rocket, ShieldCheck, Code, Beaker, Bot, User, ArrowRight } from "lucide-react";

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
            ABOUT SKILLHUB
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight max-w-3xl">
            Building the future of <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              AI skills,
            </span> together.
          </h1>

          <p className="max-w-2xl text-lg text-base-content/60 leading-relaxed font-medium">
            SkillHub is an open marketplace for AI agent skills. We empower developers, researchers, and creators to share, discover, and reuse skills that make AI agents smarter.
          </p>
        </section>

        {/* Our Mission */}
        <section className="flex flex-col items-center text-center space-y-12 w-full">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl font-bold text-base-content">Our Mission</h2>
            <p className="text-base-content/60 leading-relaxed">
              To create the largest open ecosystem of reusable AI agent skills that helps builders ship faster, learn together, and push the boundaries of what AI agents can do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content mb-2">Open & Collaborative</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">We believe in the power of open sharing. Everyone can contribute, learn, and grow together.</p>
              </div>
            </div>

            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content mb-2">Reusability First</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">Great skills shouldn't be rebuilt. SkillHub makes it easy to find, reuse, and build on top of others.</p>
              </div>
            </div>

            <div className="flex flex-col items-start text-left space-y-4 p-8 rounded-3xl bg-base-200/20 border border-base-200/30 backdrop-blur-sm">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content mb-2">Quality & Trust</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">We promote high-quality, well-documented skills that you can trust and rely on.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Who is SkillHub for? */}
        <section className="flex flex-col items-center text-center space-y-12 w-full pt-8">
          <h2 className="text-3xl font-bold text-base-content">Who is SkillHub for?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-primary mb-2 shadow-sm">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">Developers</h3>
              <p className="text-sm text-base-content/60">Find production-ready skills to integrate into your AI agents and projects.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-indigo-500 mb-2 shadow-sm">
                <Beaker className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">Researchers</h3>
              <p className="text-sm text-base-content/60">Share your experimental workflows and accelerate AI research together.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-emerald-500 mb-2 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">AI Builders</h3>
              <p className="text-sm text-base-content/60">Build better agents with pre-built skills and powerful reusable components.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-base-200 border border-base-300 text-secondary mb-2 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base-content">Creators</h3>
              <p className="text-sm text-base-content/60">Publish your unique skills and help others while growing your profile.</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/80 via-indigo-600/80 to-secondary/80 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between text-left shadow-xl shadow-primary/20">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <div className="flex items-center gap-6 z-10 mb-8 md:mb-0">
              <div className="hidden md:flex w-16 h-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md shadow-lg">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Ready to share your skills?</h2>
                <p className="text-white/80 font-medium max-w-md">
                  Join other builders and start contributing to the future of AI.
                </p>
              </div>
            </div>

            <div className="z-10 w-full md:w-auto">
              <Link 
                href="/my-skills" 
                className="btn bg-white text-indigo-900 hover:bg-base-200 border-0 rounded-xl px-8 h-14 font-bold shadow-lg w-full md:w-auto text-base flex items-center gap-2"
              >
                Create Your First Skill <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}