"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skill } from "@/app/skills/skills";
import {
  updateSkillAction,
  deleteSkillAction,
  incrementViewsAction,
  incrementDownloadsAction,
  toggleStarAction,
} from "@/app/actions/skills";
import { getCurrentUserAction } from "@/app/actions/auth";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";
import SkillInstall from "./SkillInstall";
import SkillFile, { CopyButton, FileLines } from "./SkillFile";
import SkillEditor from "./SkillEditor";
import { CATEGORIES } from "./SkillMetaFields";
import { ArrowLeft, ChevronDown, Download, Eye, FileText, Package, Pencil, Plus, Star, Trash2, X } from "lucide-react";

type SkillDetailViewProps = {
  initialSkill: Skill;
  isOwner?: boolean;
};

type ToastState = { show: boolean; message: string; type: "success" | "error" };

// Install path slug, the same rule the publisher uses for skills/<slug>/SKILL.md
const toSlug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
const fileSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

export default function SkillDetailView({ initialSkill, isOwner = false }: SkillDetailViewProps) {
  const router = useRouter();

  const [skill, setSkill] = useState<Skill>(initialSkill);
  const [isEditing, setIsEditing] = useState(false);

  // Auth
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasEditPermission, setHasEditPermission] = useState(isOwner);

  // Edit form
  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState(skill.category);
  const [visibility, setVisibility] = useState<"public" | "private">(skill.visibility || "public");
  const [description, setDescription] = useState(skill.description);
  const [content, setContent] = useState(skill.content || "");
  const [tags, setTags] = useState<string[]>(skill.tags || []);
  const [tagInput, setTagInput] = useState("");
  // Additional skills bundled with this one (no title needed, just content)
  const [editSkillEntries, setEditSkillEntries] = useState<Array<{ id: string; content: string }>>(
    (skill.subSkills || []).map((s, i) => ({ id: String(i), content: s.content }))
  );
  const [editEntryTabs, setEditEntryTabs] = useState<Record<string, "write" | "preview">>({});
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // Counters and UI
  const [starred, setStarred] = useState(skill.hasStarred || false);
  const [starsCount, setStarsCount] = useState(skill.stars || 0);
  const [viewsCount, setViewsCount] = useState(skill.views || 0);
  const [downloadsCount, setDownloadsCount] = useState(skill.downloads || 0);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSubSkills, setExpandedSubSkills] = useState<Record<number, boolean>>({});

  // Read the signed-in user and count the view
  useEffect(() => {
    async function init() {
      try {
        const dbUser = await getCurrentUserAction();
        if (dbUser) {
          setLoggedInUser(dbUser);
          localStorage.setItem("user", JSON.stringify(dbUser));
          if (isOwner || dbUser.id === (skill as any).authorId) {
            setHasEditPermission(true);
          }
        } else {
          setLoggedInUser(null);
          localStorage.removeItem("user");
          setHasEditPermission(false);
        }
      } catch (err) {
        console.error("Failed to sync session in detail view:", err);
      }

      try {
        await incrementViewsAction(skill.id);
        setViewsCount((prev) => prev + 1);
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    }
    init();
  }, [skill, isOwner]);

  // Sync when the server sends a fresh skill
  useEffect(() => {
    setSkill(initialSkill);
    setName(initialSkill.name);
    setCategory(initialSkill.category);
    setVisibility(initialSkill.visibility || "public");
    setDescription(initialSkill.description);
    setContent(initialSkill.content || "");
    setTags(initialSkill.tags || []);
    setEditSkillEntries((initialSkill.subSkills || []).map((s, i) => ({ id: String(i), content: s.content })));
    setStarred(initialSkill.hasStarred || false);
    setStarsCount(initialSkill.stars || 0);
    setViewsCount(initialSkill.views || 0);
    setDownloadsCount(initialSkill.downloads || 0);
  }, [initialSkill]);

  const triggerToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };

  const subSkills = skill.subSkills || [];
  const slug = toSlug(skill.name);

  const handleDownloadMd = async () => {
    const filename = `${fileSlug(name)}.md`;
    try {
      await incrementDownloadsAction(skill.id);
      downloadBlob(new Blob([content], { type: "text/markdown" }), filename);
      triggerToast(`Downloaded ${filename}`);
      setDownloadsCount((prev) => prev + 1);
    } catch (e) {
      console.error(e);
      triggerToast("Download failed", "error");
    }
  };

  const handleDownloadZip = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const slugBase = fileSlug(name);

      if (content) {
        zip.file(`${slugBase}/README.md`, `# ${name}\n\n${content}`);
      }
      subSkills.forEach((sub, idx) => {
        const subSlug = sub.title ? fileSlug(sub.title) : `sub-skill-${idx + 1}`;
        zip.file(
          `${slugBase}/${String(idx + 1).padStart(2, "0")}-${subSlug}.md`,
          `# ${sub.title || `Sub-Skill ${idx + 1}`}\n\n${sub.content}`
        );
      });

      downloadBlob(await zip.generateAsync({ type: "blob" }), `${slugBase}.zip`);
      await incrementDownloadsAction(skill.id);
      triggerToast(`Downloaded ${slugBase}.zip`);
      setDownloadsCount((prev) => prev + 1);
    } catch (e) {
      console.error(e);
      triggerToast("ZIP download failed", "error");
    }
  };

  const handleDownloadSubSkillMd = (subContent: string, index: number) => {
    const filename = `${fileSlug(name)}-skill-${index + 2}.md`;
    try {
      downloadBlob(new Blob([subContent], { type: "text/markdown" }), filename);
      triggerToast(`Downloaded ${filename}`);
    } catch (e) {
      console.error(e);
      triggerToast("Download failed", "error");
    }
  };

  const handleToggleStar = async () => {
    if (!loggedInUser && !localStorage.getItem("user")) {
      router.push(`/login?redirect=/skills/${skill.id}`);
      return;
    }
    const next = !starred;
    setStarred(next);
    setStarsCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      await toggleStarAction(skill.id);
    } catch (err) {
      console.error("Failed to toggle star", err);
      setStarred(!next);
      setStarsCount((c) => Math.max(0, c + (next ? -1 : 1)));
      triggerToast("Couldn't update the star", "error");
    }
  };

  // Edit mode helpers
  const addEditEntry = () => {
    const id = Math.random().toString(36).slice(2, 10);
    setEditSkillEntries((prev) => [...prev, { id, content: "" }]);
    setEditEntryTabs((prev) => ({ ...prev, [id]: "write" }));
  };
  const removeEditEntry = (id: string) => setEditSkillEntries((prev) => prev.filter((e) => e.id !== id));
  const updateEditEntryContent = (id: string, val: string) =>
    setEditSkillEntries((prev) => prev.map((e) => (e.id === id ? { ...e, content: val } : e)));

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category) {
      triggerToast("Name, category and description are required", "error");
      return;
    }

    setIsSaving(true);
    try {
      const subSkillsToSave = editSkillEntries
        .filter((entry) => entry.content.trim())
        .map((entry, i) => ({ title: `Skill ${i + 2}`, content: entry.content }));

      const updatedData: Partial<Skill> = {
        name,
        category,
        visibility,
        description,
        content,
        subSkills: subSkillsToSave,
        tags,
      };

      await updateSkillAction(skill.id, updatedData);
      setSkill((prev) => ({ ...prev, ...updatedData, updatedAt: new Date().toISOString() }));
      setIsEditing(false);
      triggerToast("Changes saved");
    } catch (err) {
      console.error("Save error:", err);
      triggerToast("Couldn't save the changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSkillAction(skill.id);
      triggerToast("Skill deleted");
      setTimeout(() => router.push("/my-skills"), 1000);
    } catch (err) {
      console.error("Delete error:", err);
      triggerToast("Couldn't delete the skill", "error");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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
  if (isEditing) {
    return (
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 pt-8">
        {toastEl}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title={`Delete ${name}?`}
          message="This deletes the skill and every skill bundled with it. It can't be undone."
          confirmText="Delete skill"
          isProcessing={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-muted">
          <Link href="/my-skills" className="shrink-0 transition-colors duration-150 ease-out hover:text-foreground">
            My skills
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-subtle">{skill.name}</span>
        </nav>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
              Edit skill
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-subtle">Changes show on the skill page once you save</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger h-9 gap-2 px-3 text-sm">
              <Trash2 className="size-4" strokeWidth={1.5} />
              Delete
            </button>
            <button type="button" onClick={handleDownloadMd} className="btn btn-quiet h-9 gap-2 px-3 text-sm">
              <Download className="size-4" strokeWidth={1.5} />
              Download .md
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary h-9 gap-2 px-3 text-sm">
              <Eye className="size-4" strokeWidth={1.5} />
              Preview
            </button>
          </div>
        </header>

        <form onSubmit={handleSave} className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-line bg-card p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="edit-name" className="field-label">
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field h-10 px-3"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="edit-category" className="field-label">
                  Category
                </label>
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field h-10 pl-3"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="edit-visibility" className="field-label">
                  Visibility
                </label>
                <select
                  id="edit-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                  className="field h-10 pl-3"
                >
                  <option value="public">Public, anyone can view it</option>
                  <option value="private">Private, only you can view it</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-tags" className="field-label">
                Tags
              </label>
              <div className="field flex min-h-10 flex-wrap items-center gap-2 px-2 py-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="tag pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      aria-label={`Remove tag ${tag}`}
                      className="grid size-4 place-items-center rounded text-muted transition-colors duration-150 ease-out hover:text-foreground"
                    >
                      <X className="size-3" strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
                <input
                  id="edit-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add a tag"
                  className="h-6 min-w-[120px] flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted focus:outline-none"
                />
              </div>
              <p className="text-xs text-muted">Press Enter to add</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="edit-description" className="field-label">
                  Description
                </label>
                <span className="font-mono text-xs tabular-nums text-muted">{description.length}/200</span>
              </div>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="What the skill does and when to use it"
                className="field resize-y px-3 py-2.5"
                required
              />
            </div>
          </div>

          <SkillEditor
            id="edit-content"
            label="Skill file"
            split
            required
            content={content}
            onContentChange={setContent}
            tab={editorTab}
            onTabChange={setEditorTab}
          />

          {editSkillEntries.map((entry, idx) => (
            <SkillEditor
              key={entry.id}
              id={`edit-entry-${entry.id}`}
              label={`Skill ${idx + 2}`}
              content={entry.content}
              onContentChange={(v) => updateEditEntryContent(entry.id, v)}
              tab={editEntryTabs[entry.id] ?? "write"}
              onTabChange={(t) => setEditEntryTabs((prev) => ({ ...prev, [entry.id]: t }))}
              onRemove={() => removeEditEntry(entry.id)}
              disabled={isSaving}
            />
          ))}

          <div>
            <button type="button" onClick={addEditEntry} disabled={isSaving} className="btn btn-secondary h-9 gap-2 px-3 text-sm">
              <Plus className="size-4" strokeWidth={1.5} />
              Add another skill
            </button>
          </div>

          <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-muted">
              Last saved{" "}
              {new Date(skill.updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditing(false)} disabled={isSaving} className="btn btn-secondary h-10 px-4 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn btn-primary h-10 gap-2 px-4 text-sm">
                {isSaving && <span className="loading loading-spinner loading-xs" />}
                {isSaving ? "Saving" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </main>
    );
  }

  /* ───────────── View mode ───────────── */
  const visibleTags = tags.filter((t) => t.toLowerCase() !== skill.category.toLowerCase());
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
    ...(skill.version ? [["Version", skill.version] as [string, string]] : []),
    ...(skill.license ? [["License", skill.license] as [string, string]] : []),
    ...(subSkills.length > 0 ? [["Skills in package", String(subSkills.length + 1)] as [string, string]] : []),
    ["Visibility", visibility === "public" ? "Public" : "Private"],
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
            {skill.category} · {visibility === "public" ? "Public" : "Private"}
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
          {hasEditPermission && (
            <button type="button" onClick={() => setIsEditing(true)} className="btn btn-quiet h-9 gap-2 px-3 text-sm">
              <Pencil className="size-4" strokeWidth={1.5} />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleStar}
            aria-pressed={starred}
            className="btn btn-secondary h-9 gap-2 px-3 text-sm"
          >
            <Star
              className={`size-4 ${starred ? "text-amber" : ""}`}
              fill={starred ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
            {starred ? "Starred" : "Star"}
            <span className="font-mono text-xs tabular-nums text-muted">{formatCount(starsCount)}</span>
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
            content={content || "# No content yet"}
            actions={<CopyButton text={content} label="Copy file" />}
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
              ["Views", viewsCount],
              ["Downloads", downloadsCount],
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
            {skill.authorBio && <p className="mt-4 text-[13px] leading-5 text-subtle">{skill.authorBio}</p>}
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
