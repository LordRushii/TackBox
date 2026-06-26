"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createSkill } from "@/app/actions/skills";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";
import {
  Globe, Lock, ChevronDown,
  AlertTriangle, FileUp, Upload, CheckCircle2
} from "lucide-react";

type UploadedFile = {
  name: string;
  size: number;
  content: string;
};

const initialState = { message: "" };

export default function UploadSkillPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createSkill, initialState);
  const [descLength, setDescLength] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function syncSession() {
      try {
        const dbUser = await getCurrentUserAction();
        if (!dbUser) {
          localStorage.removeItem("user");
          router.push("/login?redirect=/skills/upload");
        }
      } catch (e) {
        console.error(e);
      }
    }
    syncSession();
  }, [router]);

  // Intercept form submission to inject dynamic content
  const handleFormAction = (formData: FormData) => {
    if (files.length === 0) {
      return; // prevent submit if no file
    }
    formData.set("mainContent", files[0].content);
    
    const subSkillsData = files.slice(1).map(f => ({
      title: f.name,
      content: f.content
    }));
    formData.set("subSkillsData", JSON.stringify(subSkillsData));
    
    return formAction(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    Promise.all(
      selectedFiles.map((file) => {
        return new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            resolve({
              name: file.name,
              size: file.size,
              content: ev.target?.result as string,
            });
          };
          reader.readAsText(file);
        });
      })
    ).then((newFiles) => {
      setFiles(newFiles);
    });
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-12 flex flex-col justify-center">
      {/* Title block */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-semibold text-foreground">
          Upload Agent Skill
        </h1>
        <p className="mt-3 text-sm md:text-base text-foreground/60 max-w-xl mx-auto leading-relaxed">
          Upload an agent capability from your local device. Define execution details, category tags, and accessibility.
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

          {/* File Upload Section */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider mb-1">
              Skill File
            </label>
            
            <div 
              onClick={triggerFileInput}
              className={`border border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                files.length > 0 
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50" 
                  : "border-white/20 hover:border-white/40 hover:bg-white/[0.02]"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".md,.txt,.js,.ts,.json"
                multiple
                onChange={handleFileChange}
                disabled={pending}
              />
              
              {files.length > 0 ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
                  <p className="font-medium text-foreground">
                    {files.length === 1 ? files[0].name : `${files.length} files selected`}
                  </p>
                  <div className="flex flex-col gap-2 items-center mt-4 max-h-32 overflow-y-auto w-full max-w-sm">
                    {files.map((f, i) => (
                      <div key={i} className="flex justify-between items-center w-full px-3 py-2 rounded border border-white/10 bg-[#0A0A0A] text-xs text-foreground/60">
                        <span className="truncate max-w-[150px] font-medium text-foreground" title={f.name}>{f.name}</span>
                        <span className="font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="mt-6 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                  >
                    Change Files
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                    <FileUp className="w-6 h-6 text-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground mb-2">Click to select files</p>
                  <p className="text-sm text-foreground/40 text-center max-w-sm leading-relaxed">
                    Upload your markdown or text files containing the agent skill implementation. You can select multiple files.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error feedback */}
          {(files.length === 0 && pending === false && state?.message) || state?.message ? (
            <div className="p-3 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          ) : null}

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
              disabled={pending || files.length === 0}
              className={`h-11 px-8 flex items-center justify-center rounded-md text-sm font-medium transition-all gap-2 order-1 sm:order-2 ${
                files.length > 0 
                  ? "bg-white text-[#0A0A0A] hover:bg-white/90" 
                  : "bg-white/5 text-foreground/30 cursor-not-allowed"
              }`}
              suppressHydrationWarning={true}
            >
              {pending ? (
                <>
                  <span className="loading loading-spinner loading-xs border-current border-t-transparent"></span>
                  Uploading...
                </>
              ) : (
                <>
                  Upload Agent Skill
                  <Upload className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
