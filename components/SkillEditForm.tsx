"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Eye, Plus, Trash2, X } from "lucide-react";
import type { Skill, SkillEdit } from "@/features/skills/skill";
import { type SkillDraft, draftProblem, draftToEdit, entryLabel, newEntryId } from "@/features/skills/draft";
import { deleteSkillAction, updateSkillAction } from "@/features/skills/actions";
import ConfirmModal from "./ConfirmModal";
import SkillEditor from "./SkillEditor";
import { CATEGORIES } from "./SkillMetaFields";

type Tab = "write" | "preview";

type SkillEditFormProps = {
  skill: Skill;
  draft: SkillDraft;
  onDraftChange: (draft: SkillDraft) => void;
  /** Called with what was saved, once the server has it */
  onSaved: (edit: SkillEdit) => void;
  /** Show the skill page with the draft applied, keeping the draft */
  onPreview: () => void;
  /** Drop the draft */
  onCancel: () => void;
  onDownload: () => void;
  notify: (message: string, type?: "success" | "error") => void;
};

/** The owner's editor for one skill: metadata, the main file and its sub-skills, plus delete. */
export default function SkillEditForm({
  skill,
  draft,
  onDraftChange,
  onSaved,
  onPreview,
  onCancel,
  onDownload,
  notify,
}: SkillEditFormProps) {
  const router = useRouter();
  const { name, category, visibility, description, content, tags, entries } = draft;
  const set = (changes: Partial<SkillDraft>) => onDraftChange({ ...draft, ...changes });

  const [tagInput, setTagInput] = useState("");
  const [entryTabs, setEntryTabs] = useState<Record<string, Tab>>({});
  const [editorTab, setEditorTab] = useState<Tab>("write");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addEntry = () => {
    const id = newEntryId();
    set({ entries: [...entries, { id, title: "", content: "" }] });
    setEntryTabs((prev) => ({ ...prev, [id]: "write" }));
  };
  const removeEntry = (id: string) => set({ entries: entries.filter((e) => e.id !== id) });
  const updateEntry = (id: string, value: string) =>
    set({ entries: entries.map((e) => (e.id === id ? { ...e, content: value } : e)) });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        set({ tags: [...tags, val] });
        setTagInput("");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = draftProblem(draft);
    if (problem) {
      notify(problem, "error");
      return;
    }

    setIsSaving(true);
    try {
      const edit = draftToEdit(draft);
      await updateSkillAction(skill.id, edit);
      onSaved(edit);
    } catch (err) {
      console.error("Save error:", err);
      notify("Couldn't save the changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSkillAction(skill.id);
      notify("Skill deleted");
      setTimeout(() => router.push("/my-skills"), 1000);
    } catch (err) {
      console.error("Delete error:", err);
      notify("Couldn't delete the skill", "error");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`Delete ${skill.name}?`}
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
          <button type="button" onClick={onDownload} className="btn btn-quiet h-9 gap-2 px-3 text-sm">
            <Download className="size-4" strokeWidth={1.5} />
            Download .md
          </button>
          <button type="button" onClick={onPreview} className="btn btn-secondary h-9 gap-2 px-3 text-sm">
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
                onChange={(e) => set({ name: e.target.value })}
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
                onChange={(e) => set({ category: e.target.value })}
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
                onChange={(e) => set({ visibility: e.target.value as "public" | "private" })}
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
                    onClick={() => set({ tags: tags.filter((t) => t !== tag) })}
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
              onChange={(e) => set({ description: e.target.value.slice(0, 200) })}
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
          onContentChange={(value) => set({ content: value })}
          tab={editorTab}
          onTabChange={setEditorTab}
        />

        {entries.map((entry, idx) => (
          <SkillEditor
            key={entry.id}
            id={`edit-entry-${entry.id}`}
            label={entryLabel(entry, idx)}
            content={entry.content}
            onContentChange={(v) => updateEntry(entry.id, v)}
            tab={entryTabs[entry.id] ?? "write"}
            onTabChange={(t) => setEntryTabs((prev) => ({ ...prev, [entry.id]: t }))}
            onRemove={() => removeEntry(entry.id)}
            disabled={isSaving}
          />
        ))}

        <div>
          <button type="button" onClick={addEntry} disabled={isSaving} className="btn btn-secondary h-9 gap-2 px-3 text-sm">
            <Plus className="size-4" strokeWidth={1.5} />
            Add another skill
          </button>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            Last saved {new Date(skill.updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={isSaving} className="btn btn-secondary h-10 px-4 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary h-10 gap-2 px-4 text-sm">
              {isSaving && <span className="loading loading-spinner loading-xs" />}
              {isSaving ? "Saving" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
