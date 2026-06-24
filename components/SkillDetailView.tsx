"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skill } from "@/app/skills/skills";
import { updateSkillAction, deleteSkillAction, incrementViewsAction, incrementDownloadsAction } from "@/app/actions/skills";
import { getCurrentUserAction } from "@/app/actions/auth";
import SkillCard from "./SkillCard";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";
import SkillInstall from "./SkillInstall";
import { parseMarkdown } from "@/lib/markdown";
import { 
  ArrowLeft, Pencil, Download, Trash2, X, Eye, Globe, Lock, Copy, Star, Maximize2, Bookmark, Link2, Save,
  Plus, ChevronDown, ChevronUp, Package,
} from "lucide-react";

type SkillDetailViewProps = {
  initialSkill: Skill;
  isOwner?: boolean;
};

export default function SkillDetailView({ initialSkill, isOwner = false }: SkillDetailViewProps) {
  const router = useRouter();
  
  // App states
  const [skill, setSkill] = useState<Skill>(initialSkill);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "author">("content");
  
  // Auth states
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasEditPermission, setHasEditPermission] = useState(isOwner);

  // Edit form states
  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState(skill.category);
  const [visibility, setVisibility] = useState<"public" | "private">(skill.visibility || "public");
  const [description, setDescription] = useState(skill.description);
  const [content, setContent] = useState(skill.content || "");
  const [tags, setTags] = useState<string[]>(skill.tags || []);
  const [tagInput, setTagInput] = useState("");
  // Additional skill entries in edit mode (no title needed, just content)
  const [editSkillEntries, setEditSkillEntries] = useState<Array<{ id: string; content: string }>>(
    (skill.subSkills || []).map((s, i) => ({ id: String(i), content: s.content }))
  );
  const [editEntryTabs, setEditEntryTabs] = useState<Record<string, "write" | "preview">>({});

  // Interactive UI states
  const [starred, setStarred] = useState(false);
  const [starsCount, setStarsCount] = useState(skill.stars || 0);
  const [viewsCount, setViewsCount] = useState(skill.views || 0);
  const [downloadsCount, setDownloadsCount] = useState(skill.downloads || 0);
  const [savesCount, setSavesCount] = useState(skill.saves || 0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editorActiveTab, setEditorActiveTab] = useState<"write" | "preview">("write");
  // View mode skills accordion
  const [expandedSubSkills, setExpandedSubSkills] = useState<Record<number, boolean>>({});

  // Read logged in user on mount & increment view count
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
        setViewsCount(prev => prev + 1);
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    }
    init();
  }, [skill, isOwner]);

  // Sync skill data when initialSkill changes
  useEffect(() => {
    setSkill(initialSkill);
    setName(initialSkill.name);
    setCategory(initialSkill.category);
    setVisibility(initialSkill.visibility || "public");
    setDescription(initialSkill.description);
    setContent(initialSkill.content || "");
    setTags(initialSkill.tags || []);
    setEditSkillEntries((initialSkill.subSkills || []).map((s, i) => ({ id: String(i), content: s.content })));
    setStarsCount(initialSkill.stars || 0);
    setViewsCount(initialSkill.views || 0);
    setDownloadsCount(initialSkill.downloads || 0);
    setSavesCount(initialSkill.saves || 0);
  }, [initialSkill]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const handleCopyContent = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      triggerToast("Skill content copied to clipboard!");
      setSavesCount(prev => prev + 1);
    }
  };

  const handleDownloadMd = async () => {
    try {
      await incrementDownloadsAction(skill.id);
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      triggerToast("Markdown document downloaded successfully!");
      setDownloadsCount(prev => prev + 1);
    } catch (e) {
      console.error(e);
      triggerToast("Download failed.");
    }
  };

  const handleDownloadZip = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Main skill content
      if (content) {
        zip.file(`${slugBase}/README.md`, `# ${name}\n\n${content}`);
      }

      // Sub-skills as individual files
      const subSkillList = skill.subSkills || [];
      subSkillList.forEach((sub, idx) => {
        const subSlug = sub.title
          ? sub.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : `sub-skill-${idx + 1}`;
        zip.file(`${slugBase}/${String(idx + 1).padStart(2, "0")}-${subSlug}.md`, `# ${sub.title || `Sub-Skill ${idx + 1}`}\n\n${sub.content}`);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugBase}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await incrementDownloadsAction(skill.id);
      triggerToast("ZIP archive downloaded successfully!");
      setDownloadsCount(prev => prev + 1);
    } catch (e) {
      console.error(e);
      triggerToast("ZIP download failed.");
    }
  };

  // Edit mode skill entry helpers
  const addEditEntry = () => {
    const id = Math.random().toString(36).slice(2, 10);
    setEditSkillEntries(prev => [...prev, { id, content: "" }]);
    setEditEntryTabs(prev => ({ ...(prev ?? {}), [id]: "write" }));
  };

  const removeEditEntry = (id: string) => {
    setEditSkillEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEditEntryContent = (id: string, val: string) => {
    setEditSkillEntries(prev => prev.map(e => e.id === id ? { ...e, content: val } : e));
  };

  const getEditEntryTab = (id: string) => (editEntryTabs ?? {})[id] ?? "write";
  const setEditEntryTab = (id: string, tab: "write" | "preview") => {
    setEditEntryTabs(prev => ({ ...(prev ?? {}), [id]: tab }));
  };

  const toggleViewSubSkill = (idx: number) => {
    setExpandedSubSkills(prev => ({ ...(prev ?? {}), [idx]: !(prev ?? {})[idx] }));
  };

  const handleCopySubSkill = (subContent: string, index: number) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(subContent);
      triggerToast(`Skill ${index + 2} content copied to clipboard!`);
    }
  };

  const handleDownloadSubSkillMd = (subContent: string, index: number) => {
    try {
      const blob = new Blob([subContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const subSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `${subSlug}-skill-${index + 2}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast(`Skill ${index + 2} downloaded successfully!`);
    } catch (e) {
      console.error(e);
      triggerToast("Download failed.");
    }
  };

  const handleToggleStar = () => {
    if (starred) {
      setStarred(false);
      setStarsCount(prev => Math.max(0, prev - 1));
      triggerToast("Removed star from skill");
    } else {
      setStarred(true);
      setStarsCount(prev => prev + 1);
      triggerToast("Starred this skill!");
    }
  };

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

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category) {
      triggerToast("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const subSkillsToSave = editSkillEntries
        .filter(e => e.content.trim())
        .map((e, i) => ({ title: `Skill ${i + 2}`, content: e.content }));

      const updatedData: Partial<Skill> = {
        name,
        category,
        visibility,
        description,
        content,
        subSkills: subSkillsToSave,
        tags,
        views: viewsCount,
        downloads: downloadsCount,
        saves: savesCount,
        stars: starsCount,
      };

      await updateSkillAction(skill.id, updatedData);
      
      setSkill(prev => ({
        ...prev,
        ...updatedData,
        updatedAt: new Date().toISOString()
      }));
      
      setIsEditing(false);
      triggerToast("Skill updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      triggerToast("Failed to save skill changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSkillAction(skill.id);
      triggerToast("Skill deleted successfully! Redirecting...");
      setTimeout(() => {
        router.push("/my-skills");
      }, 1000);
    } catch (err) {
      console.error("Delete error:", err);
      triggerToast("Failed to delete skill.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const lineCount = content.split("\n").length;
  const initialChar = name ? name.charAt(0).toUpperCase() : "S";

  // RENDER EDIT MODE
  if (isEditing) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
        
        <ConfirmModal 
          isOpen={showDeleteConfirm}
          title="Delete Skill Confirmation"
          message={<>Are you absolutely sure you want to delete <span className="font-bold text-base-content">"{name}"</span>? This action is permanent and cannot be undone.</>}
          confirmText="Confirm Delete"
          isProcessing={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-base-content/40 mb-2 font-medium">
              <Link href="/my-skills" className="hover:text-primary transition-colors">Back to My Skills</Link>
              <span>/</span>
              <span className="text-base-content/75 font-bold">Edit Skill</span>
            </div>
            <h1 className="text-3xl font-black text-base-content tracking-tight">Edit Skill</h1>
            <p className="text-xs sm:text-sm text-base-content/50 mt-1">
              Update your skill details and content. Changes will be saved to your skill.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost btn-sm rounded-lg text-xs font-bold px-3 py-1.5 hover:bg-base-200/40"
              suppressHydrationWarning={true}
            >
              Preview
            </button>
            <button
              onClick={handleDownloadMd}
              className="btn btn-outline border-base-200/40 hover:bg-base-200/20 btn-sm rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5"
              suppressHydrationWarning={true}
            >
              <Download className="w-3.5 h-3.5" />
              Download .md
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-outline btn-error btn-sm rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5"
              suppressHydrationWarning={true}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Skill
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="card bg-base-200/30 border border-base-200/50 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              
              {/* Skill Name */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Skill Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full focus:input-primary bg-base-100/40 text-base-content placeholder:text-base-content/30 transition-all duration-200"
                  required
                  suppressHydrationWarning={true}
                />
              </div>

              {/* Category */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select select-bordered w-full focus:select-primary bg-base-100/40 text-base-content transition-all duration-200"
                  required
                  suppressHydrationWarning={true}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Fullstack">Fullstack</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Design">Design</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>

              {/* Visibility */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Visibility</span>
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                  className="select select-bordered w-full focus:select-primary bg-base-100/40 text-base-content transition-all duration-200"
                  suppressHydrationWarning={true}
                >
                  <option value="public">Public (Anyone can view)</option>
                  <option value="private">Private (Only you can view)</option>
                </select>
              </div>
            </div>

            {/* Tags Input Block */}
            <div className="form-control w-full mb-6">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Tags</span>
              </label>
              <div className="flex flex-wrap gap-2 items-center p-3 rounded-lg border border-base-200 bg-base-100/30 min-h-[50px]">
                {tags.map((tag) => (
                  <span key={tag} className="badge bg-base-200 border border-base-200/50 hover:border-error/20 text-base-content/80 pl-2.5 pr-1.5 py-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-base-content/30 hover:text-error hover:bg-error/10 p-0.5 rounded transition-all"
                      suppressHydrationWarning={true}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter..."
                  className="bg-transparent border-0 outline-none focus:ring-0 text-sm flex-1 min-w-[150px] placeholder:text-base-content/30"
                  suppressHydrationWarning={true}
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-control w-full mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <label className="label p-0">
                  <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Description</span>
                </label>
                <span className="text-xs text-base-content/40 tracking-wider">
                  {description.length}/200
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="Briefly describe this skill..."
                className="textarea textarea-bordered w-full focus:textarea-primary bg-base-100/40 text-base-content placeholder:text-base-content/30 resize-y"
                required
                suppressHydrationWarning={true}
              />
            </div>

            {/* Markdown editor & Preview grid */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Skill Content (Markdown)</span>
              </label>

              {/* Editor Tabs Toolbar */}
              <div className="border border-base-200/50 rounded-t-xl bg-base-200 bg-opacity-20 flex items-center justify-between px-3 py-2 gap-3 border-b-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorActiveTab("write")}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      editorActiveTab === "write"
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
                    onClick={() => setEditorActiveTab("preview")}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      editorActiveTab === "preview"
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
                  <div className="hidden sm:flex flex-row items-center gap-1.5">
                    <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none" suppressHydrationWarning={true}>
                      <option>Markdown</option>
                    </select>
                    <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none" suppressHydrationWarning={true}>
                      <option>Spaces</option>
                    </select>
                    <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none" suppressHydrationWarning={true}>
                      <option>2</option>
                    </select>
                    <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none" suppressHydrationWarning={true}>
                      <option>No wrap</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary btn-xs bg-gradient-to-r from-primary to-secondary text-primary-content border-0 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:opacity-90 transition-all text-[11px]"
                    suppressHydrationWarning={true}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>

              {/* Side-by-side split (Desktop) or single active view (Mobile) */}
              <div className="flex flex-col lg:flex-row min-h-[380px] border border-base-200/50 rounded-b-xl overflow-hidden shadow-inner">
                {/* Editor Column (visible when active tab is Write or on large screens) */}
                <div className={`flex flex-1 bg-base-350 bg-opacity-10 border-r border-base-200/30 ${
                  editorActiveTab === "write" ? "flex" : "hidden lg:flex"
                }`}>
                  {/* Line Numbers */}
                  <div className="bg-base-200/15 text-base-content/25 py-4 px-3 select-none text-right border-r border-base-200/30 flex flex-col min-w-[3.25rem] font-mono text-sm leading-relaxed">
                    {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write instructions in Markdown here..."
                    className="flex-1 bg-transparent py-4 px-4 outline-none resize-none text-base-content/90 font-mono text-sm focus:ring-0 leading-relaxed min-h-[350px]"
                    required
                    suppressHydrationWarning={true}
                  />
                </div>

                {/* Rendered Preview Column (visible when active tab is Preview or on large screens) */}
                <div className={`flex-1 p-6 bg-base-350 bg-opacity-5 overflow-y-auto max-h-[500px] prose prose-sm max-w-none ${
                  editorActiveTab === "preview" ? "flex" : "hidden lg:flex"
                }`}>
                  <div className="w-full text-base-content/85 font-sans leading-relaxed">
                    {content ? parseMarkdown(content) : <span className="text-base-content/30 italic text-sm">Nothing to preview yet.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== More Skills Section (Edit Mode) ===== */}

          {/* Additional skill writing boxes */}
          {editSkillEntries.map((entry, idx) => {
            const tab = getEditEntryTab(entry.id);
            const entryLineCount = entry.content.split("\n").length;
            return (
              <div key={entry.id} className="form-control w-full">
                {/* Label row */}
                <div className="flex items-center justify-between mb-1">
                  <label className="label py-1 p-0">
                    <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">
                      Skill {idx + 2}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeEditEntry(entry.id)}
                    disabled={isSaving}
                    className="btn btn-ghost btn-xs h-6 w-6 p-0 rounded-lg text-base-content/30 hover:text-error hover:bg-error/10 transition-colors"
                    title="Remove this skill"
                    suppressHydrationWarning={true}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tab toolbar */}
                <div className="border border-base-200/50 rounded-t-xl bg-base-250/20 flex items-center justify-between px-3 py-2 gap-3 border-b-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditEntryTab(entry.id, "write")}
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
                      onClick={() => setEditEntryTab(entry.id, "preview")}
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
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn btn-primary btn-xs bg-gradient-to-r from-primary to-secondary text-primary-content border-0 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:opacity-90 transition-all text-[11px]"
                      suppressHydrationWarning={true}
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>

                {/* Editor body */}
                {tab === "write" ? (
                  <div className="flex min-h-[200px] border border-base-200/50 rounded-b-xl bg-base-300/15 font-mono text-sm overflow-hidden shadow-inner">
                    <div className="bg-base-200/15 text-base-content/25 py-4 px-3 select-none text-right border-r border-base-200/30 flex flex-col min-w-[3.25rem] leading-relaxed">
                      {Array.from({ length: Math.max(1, entryLineCount) }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    <textarea
                      value={entry.content}
                      onChange={(e) => updateEditEntryContent(entry.id, e.target.value)}
                      placeholder="Write skill content in Markdown..."
                      className="flex-1 bg-transparent py-4 px-4 outline-none resize-none text-base-content/90 font-mono focus:ring-0 leading-relaxed min-h-[200px]"
                      disabled={isSaving}
                      suppressHydrationWarning={true}
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-h-[200px] border border-base-200/50 rounded-b-xl bg-base-300/10 p-6 prose max-w-none text-base-content/80 shadow-inner">
                    {entry.content ? (
                      <div className="whitespace-pre-wrap font-sans leading-relaxed text-sm">{entry.content}</div>
                    ) : (
                      <span className="text-base-content/30 italic text-sm">Nothing to preview yet.</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add More Skill button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={addEditEntry}
              disabled={isSaving}
              className="btn btn-primary border-0 bg-gradient-to-r from-primary to-secondary text-primary-content hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 rounded-xl px-5 gap-2"
              suppressHydrationWarning={true}
            >
              <Plus className="w-4 h-4" />
              Add More Skill
            </button>
          </div>


          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
            <span className="text-xs text-base-content/40">
              Last updated: {new Date(skill.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
            
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline border-base-200/50 hover:bg-base-200/20 px-6 font-semibold"
                disabled={isSaving}
                suppressHydrationWarning={true}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary bg-gradient-to-r from-primary to-secondary text-primary-content hover:shadow-lg hover:shadow-primary/20 border-0 px-8 font-semibold flex items-center gap-1.5"
                disabled={isSaving}
                suppressHydrationWarning={true}
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Skill
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    );
  }

  // RENDER VIEW MODE
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />

      {/* Decorative Glows */}
      <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[70px] pointer-events-none" />

      {/* Top Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-base-content/40 mb-6 font-medium z-10 relative">
        <Link href="/skills" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Back to Explore
        </Link>
      </div>

      {/* Hero Banner Grid (Matches Image 1 layout) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-8 border-b border-base-200/40 relative z-10">
        
        {/* Left Column: Icon, Title, Tags, Description */}
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar Icon */}
          {skill.authorAvatarUrl ? (
            <img
              src={skill.authorAvatarUrl}
              alt={skill.authorName}
              className="h-16 w-16 rounded-2xl object-cover shadow-xl shrink-0 mt-1"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl shadow-xl shrink-0 mt-1">
              {initialChar}
            </div>
          )}
          
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-base-content/95 tracking-tight leading-tight">
              {skill.name}
            </h1>
            <p className="text-sm sm:text-base text-base-content/60 max-w-3xl leading-relaxed">
              {skill.description}
            </p>
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="badge badge-success bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[10px] sm:text-xs font-bold px-2.5 py-2.5 rounded-lg flex items-center gap-1">
                {visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
              </span>
              <span className="badge bg-primary/10 border-primary/20 text-primary text-[10px] sm:text-xs font-bold px-2.5 py-2.5 rounded-lg">
                {skill.category}
              </span>
              {tags.map((tag) => (
                <span key={tag} className="badge bg-base-200 border-base-200/50 text-base-content/75 text-[10px] sm:text-xs font-bold px-2.5 py-2.5 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-start lg:justify-end">
          {hasEditPermission && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline border-base-200/60 text-base-content/75 hover:bg-base-200/40 rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5 transition-all duration-200 text-xs sm:text-sm"
              suppressHydrationWarning={true}
            >
              <Pencil className="w-4 h-4" />
              Edit Skill
            </button>
          )}

          <button
            onClick={handleCopyContent}
            className="btn btn-outline border-base-200/60 text-base-content/75 hover:bg-base-200/40 rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5 transition-all duration-200 text-xs sm:text-sm"
            suppressHydrationWarning={true}
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          
          <button
            onClick={handleDownloadMd}
            className="btn btn-outline border-base-200/60 text-base-content/75 hover:bg-base-200/40 rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5 transition-all duration-200 text-xs sm:text-sm"
            suppressHydrationWarning={true}
          >
            <Download className="w-4 h-4" />
            Download .md
          </button>

          {/* Download ZIP button – only show when there are sub-skills */}
          {(skill.subSkills && skill.subSkills.length > 0) && (
            <button
              onClick={handleDownloadZip}
              className="btn border-0 bg-gradient-to-r from-primary to-secondary text-primary-content hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5 transition-all duration-200 text-xs sm:text-sm"
              suppressHydrationWarning={true}
            >
              <Package className="w-4 h-4" />
              Download ZIP ({skill.subSkills.length + 1} files)
            </button>
          )}

          <button
            onClick={handleToggleStar}
            className={`btn rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5 transition-all duration-200 text-xs sm:text-sm ${
              starred 
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/20" 
                : "btn-outline border-base-200/60 text-base-content/75 hover:text-amber-400 hover:bg-amber-400/5"
            }`}
            suppressHydrationWarning={true}
          >
            <Star className="w-4 h-4" fill={starred ? "currentColor" : "none"} strokeWidth={starred ? 0 : 2} />
            {starred ? "Starred" : "Star"}
            <span className="font-extrabold ml-0.5">{starsCount}</span>
          </button>
        </div>
      </div>

      {/* Main Tabbed Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Left 2 Columns: Main content viewer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="card bg-base-200/30 border border-base-200/50 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-base-200/50">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-4 px-6 font-bold text-sm text-center border-b-2 transition-all duration-200 ${
                  activeTab === "content"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-base-content/50 hover:text-base-content/80 hover:bg-base-200/20"
                }`}
              >
                Skill Content
              </button>
              <button
                onClick={() => setActiveTab("author")}
                className={`flex-1 py-4 px-6 font-bold text-sm text-center border-b-2 transition-all duration-200 ${
                  activeTab === "author"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-base-content/50 hover:text-base-content/80 hover:bg-base-200/20"
                }`}
              >
                About Author
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 sm:p-8">
              {activeTab === "content" ? (
                <div className="space-y-4">
                  {/* File toolbar (Matches Image 1 pane header) */}
                  <div className="flex items-center justify-between bg-base-350 bg-opacity-20 border border-base-200/40 rounded-xl px-4 py-2 text-xs text-base-content/50">
                    <div className="flex items-center gap-1">
                      <select className="select select-bordered select-xs rounded bg-base-100/10 text-[11px] h-7 min-h-7 border-base-200/30 text-base-content/60 font-semibold focus:outline-none">
                        <option>markdown</option>
                      </select>
                    </div>
                    <button className="btn btn-ghost btn-xs rounded-lg text-base-content/40 hover:text-base-content flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Expand
                    </button>
                  </div>

                  {/* Read-Only File Viewer Container with Line Numbers */}
                  <div className="flex min-h-[300px] border border-base-200/50 rounded-xl bg-base-350 bg-opacity-10 font-mono text-sm overflow-hidden shadow-inner leading-relaxed">
                    {/* Line numbers column */}
                    <div className="bg-base-200/15 text-base-content/20 py-4 px-3 select-none text-right border-r border-base-200/30 flex flex-col min-w-[3.25rem]">
                      {content.split("\n").map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    {/* Raw Markdown display */}
                    <pre className="flex-1 py-4 px-5 text-base-content/85 overflow-x-auto whitespace-pre font-mono text-sm leading-relaxed">
                      <code>{content || "# No content matches"}</code>
                    </pre>
                  </div>

                  {/* More Skills accordion */}
                  {skill.subSkills && skill.subSkills.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                          More Skills
                          <span className="ml-2 badge badge-primary badge-sm font-bold">{skill.subSkills.length}</span>
                        </h3>
                        <button
                          onClick={handleDownloadZip}
                          className="btn btn-primary btn-xs rounded-lg flex items-center gap-1 border-0 bg-gradient-to-r from-primary to-secondary text-primary-content hover:opacity-90 transition-all"
                          suppressHydrationWarning={true}
                        >
                          <Package className="w-3 h-3" />
                          Download ZIP
                        </button>
                      </div>
                      {skill.subSkills.map((sub, idx) => (
                        <div
                          key={idx}
                          className="border border-base-200/40 rounded-xl overflow-hidden bg-base-200/10 hover:border-primary/20 transition-colors duration-200"
                        >
                          <button
                            type="button"
                            onClick={() => toggleViewSubSkill(idx)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-base-200/20 transition-colors duration-200"
                            suppressHydrationWarning={true}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-primary/70 bg-primary/10 rounded-md px-2 py-0.5 shrink-0">Skill {idx + 2}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-base-content/30 font-mono hidden sm:block">
                                {sub.content.split("\n").length} lines
                              </span>
                              {(expandedSubSkills ?? {})[idx] ? (
                                <ChevronUp className="w-4 h-4 text-base-content/40" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-base-content/40" />
                              )}
                            </div>
                          </button>
                          {(expandedSubSkills ?? {})[idx] && (
                            <div className="border-t border-base-200/30">
                              {/* Sub-skill toolbar */}
                              <div className="flex items-center justify-between bg-base-350 bg-opacity-20 px-4 py-2 text-xs text-base-content/50 border-b border-base-200/30">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold font-mono text-[10px] text-base-content/40 uppercase">markdown</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCopySubSkill(sub.content, idx)}
                                    className="btn btn-ghost btn-xs rounded-lg text-base-content/40 hover:text-base-content flex items-center gap-1 h-7 min-h-7"
                                    title="Copy content"
                                    suppressHydrationWarning={true}
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => handleDownloadSubSkillMd(sub.content, idx)}
                                    className="btn btn-ghost btn-xs rounded-lg text-base-content/40 hover:text-base-content flex items-center gap-1 h-7 min-h-7"
                                    title="Download as Markdown file"
                                    suppressHydrationWarning={true}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Save
                                  </button>
                                </div>
                              </div>
                              <div className="flex min-h-[120px] bg-base-300/10 font-mono text-sm overflow-hidden">
                                <div className="bg-base-200/10 text-base-content/15 py-3 px-2.5 select-none text-right border-r border-base-200/20 flex flex-col min-w-[2.5rem] text-xs leading-relaxed">
                                  {sub.content.split("\n").map((_, i) => (<div key={i}>{i + 1}</div>))}
                                </div>
                                <pre className="flex-1 py-3 px-4 text-base-content/80 overflow-x-auto whitespace-pre font-mono text-sm leading-relaxed">
                                  <code>{sub.content || "# No content"}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Author Pane (Matches About Author tab data) */}
                  <div className="flex items-start gap-4">
                    {skill.authorAvatarUrl ? (
                      <img
                        src={skill.authorAvatarUrl}
                        alt={skill.authorName}
                        className="h-16 w-16 rounded-2xl object-cover shadow-md shrink-0"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-xl shadow-md shrink-0">
                        {(skill.authorName || "D").split(" ").map(n => n[0]).join("")}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-base-content">{skill.authorName || "Ronak Shah"}</h3>
                      <p className="text-xs text-base-content/40 font-mono mt-0.5">@{skill.authorUsername || "ronakdev"}</p>
                      <span className="badge bg-primary/10 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mt-2.5 px-2 py-2 rounded">
                        {skill.authorRole || "Frontend Developer"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-base-200/40 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-3">Bio / Background</h4>
                    <p className="text-sm text-base-content/75 leading-relaxed">
                      {skill.authorBio || "No bio has been provided by the author of this skill yet."}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Link href={`/skills?author=${skill.authorUsername || "ronakdev"}`} className="btn btn-primary btn-sm rounded-lg shadow-sm font-semibold">
                      View Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sidebar Panels */}
        <div className="space-y-6">
          
          {/* Panel 1: Stats Counters (Views, Downloads, Saves) */}
          <div className="card bg-base-200/25 border border-base-200/50 backdrop-blur-md shadow-lg rounded-2xl p-5">
            <div className="grid grid-cols-3 divide-x divide-base-200/50 text-center">
              <div>
                <span className="text-xs text-base-content/40 font-medium block">Views</span>
                <span className="text-lg font-black text-base-content mt-1 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4 text-primary" />
                  {viewsCount >= 1000 ? `${(viewsCount / 1000).toFixed(1)}k` : viewsCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-base-content/40 font-medium block">Downloads</span>
                <span className="text-lg font-black text-base-content mt-1 flex items-center justify-center gap-1">
                  <Download className="w-4 h-4 text-secondary" />
                  {downloadsCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-base-content/40 font-medium block">Saves</span>
                <span className="text-lg font-black text-base-content mt-1 flex items-center justify-center gap-1">
                  <Bookmark className="w-4 h-4 text-accent" />
                  {savesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Install */}
          {skill.visibility === "public" && (
            <SkillInstall
              slug={skill.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")}
              skillName={skill.name}
            />
          )}

          {/* Panel 2: About Author */}
          <div className="card bg-base-200/25 border border-base-200/50 backdrop-blur-md shadow-lg rounded-2xl p-5">
            <h3 className="font-bold text-sm text-base-content/85 mb-4 uppercase tracking-wider text-[11px]">About Author</h3>
            <div className="flex items-center gap-3">
              {skill.authorAvatarUrl ? (
                <img
                  src={skill.authorAvatarUrl}
                  alt={skill.authorName}
                  className="h-11 w-11 rounded-xl object-cover shadow shrink-0"
                />
              ) : (
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${skill.authorAvatarColor || "from-blue-600 to-indigo-600"} text-white font-bold text-sm shadow shrink-0`}>
                  {(skill.authorName || "Ronak Shah").split(" ").map(n => n[0]).join("")}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-base-content block truncate">{skill.authorName || "Ronak Shah"}</span>
                <span className="text-[11px] text-base-content/40 block font-mono truncate">@{skill.authorUsername || "ronakdev"}</span>
              </div>
            </div>
            <p className="text-xs text-base-content/60 mt-4 leading-relaxed line-clamp-3">
              {skill.authorBio || "Frontend developer specialized in React, Next.js and performance optimization."}
            </p>
            <button
              onClick={() => setActiveTab("author")}
              className="btn btn-outline border-base-200/40 hover:bg-base-200/20 btn-sm w-full mt-4 rounded-lg text-xs font-bold"
            >
              View Profile
            </button>
          </div>

          {/* Panel 3: Skill Details */}
          <div className="card bg-base-200/25 border border-base-200/50 backdrop-blur-md shadow-lg rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-base-content/85 uppercase tracking-wider text-[11px]">Skill Details</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-base-200/20">
                <span className="text-base-content/40">Category</span>
                <span className="font-bold text-base-content/80">{skill.category}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-b border-base-200/20">
                <span className="text-base-content/40">Created</span>
                <span className="font-semibold text-base-content/80">
                  {new Date(skill.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-b border-base-200/20">
                <span className="text-base-content/40">Last Updated</span>
                <span className="font-semibold text-base-content/80">
                  {new Date(skill.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-b border-base-200/20">
                <span className="text-base-content/40">Version</span>
                <span className="font-semibold text-base-content/80">{skill.version || "1.0.0"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-b border-base-200/20">
                <span className="text-base-content/40">License</span>
                <span className="font-semibold text-base-content/80">{skill.license || "MIT"}</span>
              </div>
              {(skill.subSkills && skill.subSkills.length > 0) && (
                <div className="flex justify-between items-center pb-2 border-b border-b border-base-200/20">
                  <span className="text-base-content/40">Sub-Skills</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {skill.subSkills.length} included
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-base-content/40">Visibility</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                  {visibility === "public" ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Panel 4: Share This Skill */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-base-content/85 uppercase tracking-wider text-[11px]">Share this skill</h3>
            <SkillCard
              id={skill.id}
              name={skill.name}
              category={skill.category}
              description={skill.description}
              authorName={skill.authorName || "Ronak Shah"}
              authorRole={skill.authorRole || "Frontend Developer"}
              authorAvatarColor={skill.authorAvatarColor || "from-blue-600 to-indigo-600"}
              authorAvatarUrl={skill.authorAvatarUrl}
              starsCount={starsCount}
              hasStarred={starred}
              subSkillCount={(skill.subSkills || []).length}
              onStarToggle={handleToggleStar}
            />
            <div className="flex gap-2.5">
              <button 
                onClick={() => triggerToast("Shared link to Twitter/X!")}
                className="btn btn-outline border-base-200/40 hover:bg-base-200/20 flex-1 rounded-xl py-2 px-0 min-h-10 h-10 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 text-base-content/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button 
                onClick={() => triggerToast("Shared link to LinkedIn!")}
                className="btn btn-outline border-base-200/40 hover:bg-base-200/20 flex-1 rounded-xl py-2 px-0 min-h-10 h-10 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 text-base-content/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    triggerToast("Link copied to clipboard!");
                  }
                }}
                className="btn btn-outline border-base-200/40 hover:bg-base-200/20 flex-1 rounded-xl py-2 px-0 min-h-10 h-10 flex items-center justify-center transition-all duration-200"
              >
                <Link2 className="w-4 h-4 text-base-content/70" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
