"use client";

import { useActionState, useState, useEffect } from "react";
import { createSkill } from "@/app/actions/skills";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";
import {
  Globe, Lock, ChevronDown, Pencil, Eye, Maximize2, ExternalLink,
  AlertTriangle, Send, Plus, X, Save,
} from "lucide-react";

type SkillEntry = {
  id: string;
  content: string;
};

const initialState = { message: "" };

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NewSkillPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createSkill, initialState);
  const [descLength, setDescLength] = useState(0);
  const [mainContent, setMainContent] = useState("");
  const [mainTab, setMainTab] = useState<"write" | "preview">("write");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  // Additional skill entries
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [entryTabs, setEntryTabs] = useState<Record<string, "write" | "preview">>({});

  useEffect(() => {
    async function syncSession() {
      try {
        const dbUser = await getCurrentUserAction();
        if (!dbUser) {
          localStorage.removeItem("user");
          router.push("/login?redirect=/skills/create");
        }
      } catch (e) {
        console.error(e);
      }
    }
    syncSession();
  }, [router]);

  const handleFormAction = (formData: FormData) => {
    formData.set("mainContent", mainContent);
    const entries = skillEntries
      .filter((e) => e.content.trim())
      .map(({ content }, i) => ({ title: `Skill ${i + 2}`, content }));
    formData.set("subSkillsData", JSON.stringify(entries));
    return formAction(formData);
  };

  const addEntry = () => {
    const id = generateId();
    setSkillEntries((prev) => [...prev, { id, content: "" }]);
    setEntryTabs((prev) => ({ ...prev, [id]: "write" }));
  };

  const removeEntry = (id: string) => {
    setSkillEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, content: string) => {
    setSkillEntries((prev) => prev.map((e) => (e.id === id ? { ...e, content } : e)));
  };

  const getTab = (id: string) => entryTabs[id] ?? "write";
  const setTab = (id: string, tab: "write" | "preview") =>
    setEntryTabs((prev) => ({ ...prev, [id]: tab }));

  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-12 flex flex-col justify-center">
      {/* Title block */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-semibold text-foreground">
          Create a New Agent Skill
        </h1>
        <p className="mt-3 text-sm md:text-base text-foreground/60 max-w-xl mx-auto leading-relaxed">
          Publish a new agent capability. Define execution details, category tags, and accessibility.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white/[0.02] border border-white/10 shadow-2xl shadow-black rounded-lg overflow-hidden">
        <form action={handleFormAction} className="p-6 sm:p-8 md:p-10 flex flex-col gap-8">

          {/* Row 1: Skill Name, Category, Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="flex flex-col gap-2 w-full">
              <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                Agent Skill Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Next.js Performance Optimization"
                className="h-10 px-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none transition-all"
                required
                disabled={pending}
                suppressHydrationWarning={true}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                Category
              </label>
              <select
                name="category"
                className="h-10 px-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground/80 focus:outline-none transition-all"
                required
                defaultValue=""
                disabled={pending}
                suppressHydrationWarning={true}
              >
                <option value="" disabled>Select a category</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Fullstack</option>
                <option value="DevOps">DevOps</option>
                <option value="Design">Design</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                Visibility
              </label>
              <div className="dropdown w-full dropdown-bottom dropdown-end" suppressHydrationWarning={true}>
                <div
                  tabIndex={0}
                  role="button"
                  className="h-10 px-3 rounded-md bg-[#0A0A0A] border border-white/10 hover:border-white/20 w-full flex items-center justify-between text-left transition-all"
                  suppressHydrationWarning={true}
                >
                  <div className="flex items-center gap-2">
                    {visibility === "public" ? (
                      <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-medium text-sm text-foreground">
                      {visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-[#0A0A0A] rounded-lg z-50 w-full p-1.5 shadow-2xl border border-white/10 mt-1"
                >
                  <li>
                    <button type="button" onClick={() => setVisibility("public")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${visibility === "public" ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}`}
                      suppressHydrationWarning={true}>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">Public</span>
                        <span className="text-[10px] text-foreground/50 mt-0.5">Anyone can view this skill</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setVisibility("private")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${visibility === "private" ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}`}
                      suppressHydrationWarning={true}>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">Private</span>
                        <span className="text-[10px] text-foreground/50 mt-0.5">Only you can view this skill</span>
                      </div>
                    </button>
                  </li>
                </ul>
                <input type="hidden" name="visibility" value={visibility} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 w-full relative">
            <div className="flex justify-between items-baseline mb-1">
              <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                Description
              </label>
              <span className="text-[11px] text-foreground/40">{descLength}/200</span>
            </div>
            <textarea
              name="description"
              rows={3}
              placeholder="Briefly describe what this skill helps with, its purpose, and who it's for..."
              className="w-full p-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none transition-all resize-y"
              required
              maxLength={200}
              onChange={(e) => setDescLength(e.target.value.length)}
              disabled={pending}
              suppressHydrationWarning={true}
            />
          </div>

          {/* ── Skill 1 (main) ── */}
          <SkillEditor
            label="Skill 1"
            isFirst
            content={mainContent}
            tab={mainTab}
            onContentChange={setMainContent}
            onTabChange={setMainTab}
            disabled={pending}
          />

          {/* ── Additional skill editors ── */}
          {skillEntries.map((entry, idx) => (
            <SkillEditor
              key={entry.id}
              label={`Skill ${idx + 2}`}
              content={entry.content}
              tab={getTab(entry.id)}
              onContentChange={(v) => updateEntry(entry.id, v)}
              onTabChange={(t) => setTab(entry.id, t)}
              onRemove={() => removeEntry(entry.id)}
              disabled={pending}
            />
          ))}

          {/* + Add More Skill button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={addEntry}
              disabled={pending}
              className="h-9 px-4 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-sm font-medium text-foreground transition-all flex items-center gap-2"
              suppressHydrationWarning={true}
            >
              <Plus className="w-4 h-4 opacity-70" />
              Add More Skill
            </button>
          </div>

          {/* Error feedback */}
          {state?.message && (
            <div className="p-3 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-white/10">
            <Link
              href="/my-skills"
              className="h-11 px-6 flex items-center justify-center rounded-md bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10 text-sm font-medium text-foreground transition-all order-2 sm:order-1"
            >
              Cancel &amp; Return
            </Link>

            <button
              type="submit"
              disabled={pending}
              className="h-11 px-8 flex items-center justify-center rounded-md bg-white text-[#0A0A0A] hover:bg-white/90 text-sm font-medium transition-all gap-2 order-1 sm:order-2"
              suppressHydrationWarning={true}
            >
              {pending ? (
                <>
                  <span className="loading loading-spinner loading-xs border-current border-t-transparent"></span>
                  Creating Agent Skill...
                </>
              ) : (
                <>
                  Create Agent Skill
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Reusable skill writing-box component
───────────────────────────────────────────── */
type SkillEditorProps = {
  label: string;
  isFirst?: boolean;
  content: string;
  tab: "write" | "preview";
  onContentChange: (v: string) => void;
  onTabChange: (t: "write" | "preview") => void;
  onRemove?: () => void;
  disabled?: boolean;
};

function SkillEditor({
  label,
  isFirst = false,
  content,
  tab,
  onContentChange,
  onTabChange,
  onRemove,
  disabled,
}: SkillEditorProps) {
  const lineCount = content.split("\n").length;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
          {label}
        </label>
        {!isFirst && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="p-1 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition-colors"
            title="Remove this skill"
            suppressHydrationWarning={true}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden flex flex-col bg-[#0A0A0A]">
        {/* Tab Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/10">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTabChange("write")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                tab === "write"
                  ? "bg-white/[0.06] text-foreground"
                  : "text-foreground/50 hover:text-foreground hover:bg-white/[0.02]"
              }`}
              suppressHydrationWarning={true}
            >
              <Pencil className="w-3.5 h-3.5 opacity-70" />
              Write
            </button>
            <button
              type="button"
              onClick={() => onTabChange("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                tab === "preview"
                  ? "bg-white/[0.06] text-foreground"
                  : "text-foreground/50 hover:text-foreground hover:bg-white/[0.02]"
              }`}
              suppressHydrationWarning={true}
            >
              <Eye className="w-3.5 h-3.5 opacity-70" />
              Preview
            </button>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-foreground/40 uppercase tracking-wider pr-1">
            Markdown
          </div>
        </div>

        {/* Editor body */}
        {tab === "write" ? (
          <div className="flex min-h-[200px] font-mono text-sm leading-relaxed overflow-x-auto">
            <div className="bg-[#0A0A0A] text-white/20 py-4 px-3 select-none text-right border-r border-white/5 flex flex-col min-w-[3rem]">
              {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={`Write skill content in Markdown...`}
              className="flex-1 bg-transparent py-4 px-4 outline-none resize-none text-foreground/90 font-mono focus:ring-0 min-h-[200px]"
              disabled={disabled}
              suppressHydrationWarning={true}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-[200px] bg-[#0A0A0A] p-6 prose prose-invert max-w-none text-foreground/80">
            {content ? (
              <div className="whitespace-pre-wrap font-sans leading-relaxed text-sm">{content}</div>
            ) : (
              <span className="text-foreground/30 italic text-sm">Nothing to preview yet.</span>
            )}
          </div>
        )}
      </div>

      {isFirst && (
        <div className="flex justify-between items-center text-[11px] mt-1 text-foreground/40 px-1">
          <span>Tip: Use Markdown for better formatting. Click "Add More Skill" to include additional skills.</span>
          <a
            href="https://www.markdownguide.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            Markdown Guide
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
