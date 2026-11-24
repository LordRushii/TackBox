"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Skill, SkillEdit } from "@/features/skills/skill";
import { type SkillDraft, draftFrom, draftToEdit } from "@/features/skills/draft";
import { toSlug } from "@/features/skills/slug";
import { incrementViewsAction, incrementDownloadsAction, toggleStarAction } from "@/features/skills/actions";
import { useViewer } from "@/features/auth/viewer";
import Toast from "./Toast";
import SkillInstall from "./SkillInstall";
import SkillFile, { CopyButton, FileLines } from "./SkillFile";
import SkillEditForm from "./SkillEditForm";
import { ArrowLeft, ChevronDown, Download, FileText, Package, Pencil, Star } from "lucide-react";

type SkillDetailViewProps = {
  initialSkill: Skill;
};

type ToastState = { show: boolean; message: string; type: "success" | "error" };

const formatCount = (n: number) => n.toLocaleString("en-US");
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const lineCount = (text: string) => text.split("\n").length;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SkillDetailView({ initialSkill }: SkillDetailViewProps) {
  const router = useRouter();
  const viewer = useViewer();
  const isOwner = viewer?.id === initialSkill.authorId;

  // The saved skill, counters included. A fresh copy from the server replaces it
  const [saved, setSaved] = useState<Skill>(initialSkill);
  const [fromServer, setFromServer] = useState(initialSkill);
  if (fromServer !== initialSkill) {
    setFromServer(initialSkill);
    setSaved(initialSkill);
  }

  // The owner's unsaved edit. Previewing keeps it; saving or cancelling drops it
  const [draft, setDraft] = useState<SkillDraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [expandedSubSkills, setExpandedSubSkills] = useState<Record<number, boolean>>({});

  // While previewing a draft the page shows it in place of the saved skill
  const skill: Skill = draft ? { ...saved, ...draftToEdit(draft) } : saved;
  const subSkills = skill.subSkills;
  // The registry path and every download file name use the stored slug
  const slug = skill.slug;

  // Count the view once per page load; the server counts each viewer once a day
  useEffect(() => {
    incrementViewsAction(initialSkill.id).then((counted) => {
      if (counted) setSaved((s) => ({ ...s, views: s.views + 1 }));
    });
  }, [initialSkill.id]);

  const triggerToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };

  const countDownload = async () => {
    if (await incrementDownloadsAction(skill.id)) {
      setSaved((s) => ({ ...s, downloads: s.downloads + 1 }));
    }
  };

  const handleDownloadMd = async () => {
    const filename = `${slug}.md`;
    try {
      downloadBlob(new Blob([skill.content], { type: "text/markdown" }), filename);
      triggerToast(`Downloaded ${filename}`);
      await countDownload();
    } catch (e) {
      console.error(e);
      triggerToast("Download failed", "error");
    }
  };

  const handleDownloadZip = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      if (skill.content) {
        zip.file(`${slug}/README.md`, `# ${skill.name}\n\n${skill.content}`);
      }
      subSkills.forEach((sub, idx) => {
        const subSlug = toSlug(sub.title) || `sub-skill-${idx + 1}`;
        zip.file(
          `${slug}/${String(idx + 1).padStart(2, "0")}-${subSlug}.md`,
          `# ${sub.title || `Sub-Skill ${idx + 1}`}\n\n${sub.content}`
        );
      });

      downloadBlob(await zip.generateAsync({ type: "blob" }), `${slug}.zip`);
      triggerToast(`Downloaded ${slug}.zip`);
      await countDownload();
    } catch (e) {
      console.error(e);
      triggerToast("ZIP download failed", "error");
    }
  };

  const handleDownloadSubSkillMd = (subContent: string, index: number) => {
    const filename = `${slug}-skill-${index + 2}.md`;
    try {
      downloadBlob(new Blob([subContent], { type: "text/markdown" }), filename);
      triggerToast(`Downloaded ${filename}`);
    } catch (e) {
      console.error(e);
      triggerToast("Download failed", "error");
    }
  };

  const handleToggleStar = async () => {
    if (!viewer) {
      router.push(`/login?redirect=/skills/${skill.id}`);
      return;
    }
    const star = (on: boolean) =>
      setSaved((s) => ({ ...s, hasStarred: on, stars: Math.max(0, s.stars + (on ? 1 : -1)) }));
    const next = !saved.hasStarred;
    star(next);
    try {
      await toggleStarAction(skill.id);
    } catch (err) {
      console.error("Failed to toggle star", err);
      star(!next);
      triggerToast("Couldn't update the star", "error");
    }
  };

  const startEditing = () => {
    setDraft((d) => d ?? draftFrom(saved));
    setIsEditing(true);
  };

  const handleSaved = (edit: SkillEdit) => {
    setSaved((prev) => ({ ...prev, ...edit, updatedAt: new Date().toISOString() }));
    setDraft(null);
    setIsEditing(false);
    triggerToast("Changes saved");
  };

  const stopEditing = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const toastEl = (
    <Toast
      show={toast.show}
      message={toast.message}
      type={toast.type}
      onClose={() => setToast((t) => ({ ...t, show: false }))}
    />
  );

  /* ───────────── Edit mode ───────────── */
  if (isEditing && draft) {
    return (
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 pt-8">
        {toastEl}
        <SkillEditForm
          skill={saved}
          draft={draft}
          onDraftChange={setDraft}
          onSaved={handleSaved}
          onPreview={() => setIsEditing(false)}
          onCancel={stopEditing}
          onDownload={handleDownloadMd}
          notify={triggerToast}
        />
      </main>
    );
  }

  /* ───────────── View mode ───────────── */
  const visibleTags = skill.tags.filter((t) => t.toLowerCase() !== skill.category.toLowerCase());
  const authorName = skill.authorName || "Unknown author";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const details: [string, string][] = [
    ["Category", skill.category],
    ["Created", formatDate(skill.createdAt)],
    ["Updated", formatDate(skill.updatedAt)],
    ...(subSkills.length > 0 ? [["Skills in package", String(subSkills.length + 1)] as [string, string]] : []),
    ["Visibility", skill.visibility === "public" ? "Public" : "Private"],
  ];

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 pt-8">
      {toastEl}

      <nav aria-label="Breadcrumb">
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors duration-150 ease-out hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          All skills
        </Link>
      </nav>

      <header className="mt-8 flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="font-mono text-xs text-muted">
            {skill.category} · {skill.visibility === "public" ? "Public" : "Private"}
          </p>
          <h1 className="mt-3 break-words font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px]">
            {skill.name}
          </h1>
          <p className="mt-3 text-base leading-[26px] text-subtle">{skill.description}</p>
          {visibleTags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isOwner && draft && <span className="text-[13px] text-muted">Previewing unsaved changes</span>}
          {isOwner && (
            <button type="button" onClick={startEditing} className="btn btn-quiet h-9 gap-2 px-3 text-sm">
              <Pencil className="size-4" strokeWidth={1.5} />
              {draft ? "Back to editing" : "Edit"}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleStar}
            aria-pressed={skill.hasStarred}
            className="btn btn-secondary h-9 gap-2 px-3 text-sm"
          >
            <Star
              className={`size-4 ${skill.hasStarred ? "text-amber" : ""}`}
              fill={skill.hasStarred ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
            {skill.hasStarred ? "Starred" : "Star"}
            <span className="font-mono text-xs tabular-nums text-muted">{formatCount(skill.stars)}</span>
          </button>
          {subSkills.length > 0 && (
            <button type="button" onClick={handleDownloadZip} className="btn btn-secondary h-9 gap-2 px-3 text-sm">
              <Package className="size-4" strokeWidth={1.5} />
              Download ZIP
            </button>
          )}
          <button type="button" onClick={handleDownloadMd} className="btn btn-primary h-9 gap-2 px-3 text-sm">
            <Download className="size-4" strokeWidth={1.5} />
            Download .md
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* The file itself */}
        <div className="flex min-w-0 flex-col gap-8">
          <SkillFile
            path={`skills/${slug}/SKILL.md`}
            content={skill.content || "# No content yet"}
            actions={<CopyButton text={skill.content} label="Copy file" />}
          />

          {subSkills.length > 0 && (
            <section aria-labelledby="more-skills">
              <h2 id="more-skills" className="flex items-baseline gap-2 font-heading text-lg font-medium text-foreground">
                More skills in this package
                <span className="font-mono text-xs font-normal tabular-nums text-muted">{subSkills.length}</span>
              </h2>
              <ul className="mt-4 flex flex-col gap-2">
                {subSkills.map((sub, idx) => {
                  const open = !!expandedSubSkills[idx];
                  const title = sub.title || `Skill ${idx + 2}`;
                  return (
                    <li key={idx} className="overflow-hidden rounded-xl border border-line bg-card">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setExpandedSubSkills((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="flex h-12 w-full items-center gap-3 px-4 text-left transition-colors duration-150 ease-out hover:bg-raised"
                      >
                        <FileText className="size-4 shrink-0 text-muted" strokeWidth={1.5} />
                        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">{title}</span>
                        <span className="hidden font-mono text-xs tabular-nums text-muted sm:block">
                          {lineCount(sub.content)} lines
                        </span>
                        <ChevronDown
                          className={`size-4 shrink-0 text-muted transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
                          strokeWidth={1.5}
                        />
                      </button>
                      {open && (
                        <div className="border-t border-line bg-deep">
                          <div className="flex h-10 items-center justify-end gap-1 border-b border-line px-2">
                            <CopyButton text={sub.content} label={`Copy ${title}`} />
                            <button
                              type="button"
                              onClick={() => handleDownloadSubSkillMd(sub.content, idx)}
                              aria-label={`Download ${title}`}
                              title="Download .md"
                              className="grid size-8 place-items-center rounded-lg text-muted transition-colors duration-150 ease-out hover:bg-raised hover:text-foreground"
                            >
                              <Download className="size-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          <FileLines content={sub.content || "# No content yet"} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {skill.visibility === "public" && <SkillInstall slug={slug} />}

          <dl className="grid grid-cols-2 divide-x divide-line rounded-2xl border border-line bg-card">
            {[
              ["Views", skill.views],
              ["Downloads", skill.downloads],
            ].map(([label, value]) => (
              <div key={label} className="px-5 py-4">
                <dt className="text-[13px] text-muted">{label}</dt>
                <dd className="mt-1 font-heading text-2xl font-medium tabular-nums text-foreground">
                  {formatCount(value as number)}
                </dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="author-title" className="rounded-2xl border border-line bg-card p-5">
            <h2 id="author-title" className="font-sans text-[13px] font-normal text-muted">
              Author
            </h2>
            <div className="mt-3 flex items-center gap-3">
              {skill.authorAvatarUrl ? (
                <img src={skill.authorAvatarUrl} alt="" className="size-10 shrink-0 rounded-lg border border-line object-cover" />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-raised text-sm font-medium text-subtle">
                  {authorInitials}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{authorName}</p>
                {skill.authorUsername && (
                  <p className="truncate font-mono text-xs text-muted">@{skill.authorUsername}</p>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="details-title" className="rounded-2xl border border-line bg-card px-5 pb-2 pt-5">
            <h2 id="details-title" className="font-sans text-[13px] font-normal text-muted">
              Details
            </h2>
            <dl className="mt-2 text-[13px]">
              {details.map(([label, value]) => (
                <div key={label} className="flex h-10 items-center justify-between gap-4 border-b border-line last:border-b-0">
                  <dt className="text-muted">{label}</dt>
                  <dd className="truncate tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
