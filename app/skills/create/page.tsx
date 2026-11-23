"use client";

import { useActionState, useState, useEffect } from "react";
import { createSkill } from "@/features/skills/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import SkillMetaFields from "@/components/SkillMetaFields";
import SkillEditor from "@/components/SkillEditor";

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
  const [mainContent, setMainContent] = useState("");
  const [mainTab, setMainTab] = useState<"write" | "preview">("write");

  // Additional skills bundled with the main one
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

  const removeEntry = (id: string) => setSkillEntries((prev) => prev.filter((e) => e.id !== id));
  const updateEntry = (id: string, content: string) =>
    setSkillEntries((prev) => prev.map((e) => (e.id === id ? { ...e, content } : e)));

  return (
    <main className="mx-auto w-full max-w-[960px] flex-1 px-6 pb-24 pt-8">
      <nav aria-label="Breadcrumb">
        <Link
          href="/my-skills"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors duration-150 ease-out hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          My skills
        </Link>
      </nav>

      <header className="mt-8">
        <h1 className="font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">New skill</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-subtle">
          Write the frontmatter and instructions in Markdown, then make the skill public or keep it private.
        </p>
      </header>

      <form action={handleFormAction} className="mt-8 flex flex-col gap-8">
        <SkillMetaFields disabled={pending} />

        <div className="flex flex-col gap-3">
          <SkillEditor
            id="skill-content"
            label="Skill file"
            content={mainContent}
            onContentChange={setMainContent}
            tab={mainTab}
            onTabChange={setMainTab}
            disabled={pending}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>Extra skills are bundled with this one and download together as a ZIP</span>
            <a
              href="https://www.markdownguide.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-subtle transition-colors duration-150 ease-out hover:text-foreground"
            >
              Markdown guide
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {skillEntries.map((entry, idx) => (
          <SkillEditor
            key={entry.id}
            id={`skill-entry-${entry.id}`}
            label={`Skill ${idx + 2}`}
            content={entry.content}
            onContentChange={(v) => updateEntry(entry.id, v)}
            tab={entryTabs[entry.id] ?? "write"}
            onTabChange={(t) => setEntryTabs((prev) => ({ ...prev, [entry.id]: t }))}
            onRemove={() => removeEntry(entry.id)}
            disabled={pending}
          />
        ))}

        <div>
          <button type="button" onClick={addEntry} disabled={pending} className="btn btn-secondary h-9 gap-2 px-3 text-sm">
            <Plus className="size-4" strokeWidth={1.5} />
            Add another skill
          </button>
        </div>

        {state?.message && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[10px] border border-negative/20 bg-negative/10 px-3 py-2.5 text-[13px] leading-5 text-negative"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            <span>{state.message}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <Link href="/my-skills" className="btn btn-quiet h-10 px-4 text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="btn btn-primary h-10 gap-2 px-4 text-sm">
            {pending && <span className="loading loading-spinner loading-xs" />}
            {pending ? "Creating" : "Create skill"}
          </button>
        </div>
      </form>
    </main>
  );
}
