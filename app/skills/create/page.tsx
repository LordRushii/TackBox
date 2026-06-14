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

  const mainLineCount = mainContent.split("\n").length;

  // Intercept form submission to inject dynamic content
  const handleFormAction = (formData: FormData) => {
    formData.set("mainContent", mainContent);
    const entries = skillEntries
      .filter((e) => e.content.trim())
      .map(({ content }, i) => ({ title: `Skill ${i + 2}`, content }));
    formData.set("subSkillsData", JSON.stringify(entries));
    return formAction(formData);
  };

  // Entry helpers
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
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col justify-center">
      {/* Title block */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
          Create a New Agent Skill
        </h1>
        <p className="mt-2.5 text-sm md:text-base text-base-content/60 max-w-xl mx-auto leading-relaxed">
          Publish a new agent capability. Define execution details, category tags, and accessibility.
        </p>
      </div>

      {/* Form Card */}
      <div className="card bg-base-200/30 border border-base-200/50 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
        <form action={handleFormAction} className="card-body p-6 sm:p-8 md:p-10 gap-6">

          {/* Row 1: Skill Name, Category, Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Agent Skill Name</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Next.js Performance Optimization"
                className="input input-bordered w-full focus:input-primary transition-all duration-200 bg-base-100/40 placeholder:text-base-content/30"
                required
                disabled={pending}
                suppressHydrationWarning={true}
              />
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Category</span>
              </label>
              <select
                name="category"
                className="select select-bordered w-full focus:select-primary transition-all duration-200 bg-base-100/40 text-base-content/80"
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

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Visibility</span>
              </label>
              <div className="dropdown w-full dropdown-bottom dropdown-end" suppressHydrationWarning={true}>
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-outline border-base-200/50 hover:bg-base-200/20 w-full flex items-center justify-between px-4 py-2.5 h-auto font-normal text-left min-h-12 bg-base-100/30 hover:border-primary/20"
                  suppressHydrationWarning={true}
                >
                  <div className="flex items-center gap-2.5">
                    {visibility === "public" ? (
                      <Globe className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm text-base-content/95 leading-none">
                        {visibility === "public" ? "Public" : "Private"}
                      </span>
                      <span className="text-[10px] text-base-content/50 leading-none">
                        {visibility === "public" ? "Anyone can view this skill" : "Only you can view this skill"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-base-content/40 shrink-0" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-300 rounded-xl z-50 w-full p-1.5 shadow-xl border border-base-200/50 mt-1"
                >
                  <li>
                    <button type="button" onClick={() => setVisibility("public")}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-left ${visibility === "public" ? "active bg-primary/20" : "hover:bg-base-200/60"}`}
                      suppressHydrationWarning={true}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-base-content/90">Public</span>
                        <span className="text-xs text-base-content/50">Anyone can view this skill</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setVisibility("private")}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-left ${visibility === "private" ? "active bg-primary/20" : "hover:bg-base-200/60"}`}
                      suppressHydrationWarning={true}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-base-content/90">Private</span>
                        <span className="text-xs text-base-content/50">Only you can view this skill</span>
                      </div>
                    </button>
                  </li>
                </ul>
                <input type="hidden" name="visibility" value={visibility} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-control w-full relative">
            <div className="flex justify-between items-baseline mb-1">
              <label className="label p-0">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Description</span>
              </label>
              <span className="text-xs text-base-content/40 tracking-wider">{descLength}/200</span>
            </div>
            <textarea
              name="description"
              rows={3}
              placeholder="Briefly describe what this skill helps with, its purpose, and who it's for..."
              className="textarea textarea-bordered w-full focus:textarea-primary transition-all duration-200 bg-base-100/40 placeholder:text-base-content/30 h-20 resize-y"
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
              className="btn btn-primary border-0 bg-gradient-to-r from-primary to-secondary text-primary-content hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 rounded-xl px-5 gap-2"
              suppressHydrationWarning={true}
            >
              <Plus className="w-4 h-4" />
              Add More Skill
            </button>
          </div>

          {/* Error feedback */}
          {state?.message && (
            <div className="alert alert-error text-sm py-2.5 px-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-base-200/30">
            <Link
              href="/my-skills"
              className="btn btn-outline border-base-200/50 hover:bg-base-200/20 px-6 font-semibold transition-all duration-200 order-2 sm:order-1"
            >
              Cancel &amp; Return
            </Link>

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary text-primary-content hover:shadow-lg hover:shadow-primary/20 hover:opacity-95 border-0 px-8 font-semibold transition-all duration-300 flex items-center gap-1.5 order-1 sm:order-2"
              suppressHydrationWarning={true}
            >
              {pending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Creating Agent Skill...
                </>
              ) : (
                <>
                  Create Agent Skill
                  <Send className="w-3.5 h-3.5" />
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
    <div className="form-control w-full">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <label className="label py-1 p-0">
          <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">
            {label}
          </span>
        </label>
        {!isFirst && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="btn btn-ghost btn-xs h-6 w-6 p-0 rounded-lg text-base-content/30 hover:text-error hover:bg-error/10 transition-colors"
            title="Remove this skill"
            suppressHydrationWarning={true}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tab Toolbar */}
      <div className="border border-base-200/50 rounded-t-xl bg-base-250/20 flex items-center justify-between px-3 py-2 gap-3 border-b-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange("write")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              tab === "write"
                ? "border border-primary/50 bg-primary/10 text-primary"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/40"
            }`}
            suppressHydrationWarning={true}
          >
            <Pencil className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => onTabChange("preview")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              tab === "preview"
                ? "border border-primary/50 bg-primary/10 text-primary"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/40"
            }`}
            suppressHydrationWarning={true}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none" suppressHydrationWarning={true}>
            <option>Markdown</option>
          </select>
          <button
            type="submit"
            disabled={disabled}
            className="btn btn-primary btn-xs bg-gradient-to-r from-primary to-secondary text-primary-content border-0 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:opacity-90 transition-all text-[11px]"
            suppressHydrationWarning={true}
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <Maximize2 className="w-3.5 h-3.5 text-base-content/40 hover:text-base-content/70 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Editor body */}
      {tab === "write" ? (
        <div className="flex min-h-[200px] border border-base-200/50 rounded-b-xl bg-base-300/15 font-mono text-sm overflow-hidden shadow-inner">
          <div className="bg-base-200/15 text-base-content/25 py-4 px-3 select-none text-right border-r border-base-200/30 flex flex-col min-w-[3.25rem] leading-relaxed">
            {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={`Write skill content in Markdown...`}
            className="flex-1 bg-transparent py-4 px-4 outline-none resize-none text-base-content/90 font-mono focus:ring-0 leading-relaxed min-h-[200px]"
            disabled={disabled}
            suppressHydrationWarning={true}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-[200px] border border-base-200/50 rounded-b-xl bg-base-300/10 p-6 prose max-w-none text-base-content/80 shadow-inner">
          {content ? (
            <div className="whitespace-pre-wrap font-sans leading-relaxed text-sm">{content}</div>
          ) : (
            <span className="text-base-content/30 italic text-sm">Nothing to preview yet.</span>
          )}
        </div>
      )}

      {isFirst && (
        <div className="flex justify-between items-center text-[11px] mt-2.5 px-1 text-base-content/50">
          <span>💡 Tip: Use Markdown for better formatting. Click &quot;Add More Skill&quot; to include additional skills.</span>
          <a
            href="https://www.markdownguide.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 font-semibold text-primary/80 hover:text-primary transition-colors"
          >
            Markdown Guide
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
