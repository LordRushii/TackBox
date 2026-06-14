"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createSkill } from "@/app/actions/skills";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";
import {
  Globe, Lock, ChevronDown, Eye, ExternalLink,
  AlertTriangle, Send, FileUp, Upload, CheckCircle2
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
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col justify-center">
      {/* Title block */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
          Upload Agent Skill
        </h1>
        <p className="mt-2.5 text-sm md:text-base text-base-content/60 max-w-xl mx-auto leading-relaxed">
          Upload an agent capability from your local device. Define execution details, category tags, and accessibility.
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

          {/* File Upload Section */}
          <div className="form-control w-full">
            <label className="label py-1 p-0 mb-1">
              <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">
                Skill File
              </span>
            </label>
            
            <div 
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                files.length > 0 
                  ? "border-success/50 bg-success/5" 
                  : "border-base-200/60 hover:border-primary/50 hover:bg-base-200/30"
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
                  <CheckCircle2 className="w-12 h-12 text-success mb-3" />
                  <p className="font-bold text-base-content/90">
                    {files.length === 1 ? files[0].name : `${files.length} files selected`}
                  </p>
                  <div className="flex flex-col gap-1 items-center mt-2 max-h-32 overflow-y-auto w-full max-w-sm">
                    {files.map((f, i) => (
                      <p key={i} className="text-xs text-base-content/60 bg-base-100/50 px-3 py-1.5 rounded-md w-full text-center flex justify-between">
                        <span className="truncate max-w-[150px]" title={f.name}>{f.name}</span>
                        <span>{(f.size / 1024).toFixed(1)} KB • {f.content.split('\n').length} lines</span>
                      </p>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline btn-success mt-4 rounded-lg px-6"
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
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileUp className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-bold text-base-content/90 mb-1">Click to select files</p>
                  <p className="text-sm text-base-content/50 text-center max-w-sm">
                    Upload your markdown or text files containing the agent skill implementation. You can select multiple files!
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error feedback */}
          {(files.length === 0 && pending === false && state?.message) ? (
            <div className="alert alert-error text-sm py-2.5 px-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          ) : state?.message ? (
             <div className="alert alert-error text-sm py-2.5 px-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          ) : null}

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
              disabled={pending || files.length === 0}
              className={`btn px-8 font-semibold transition-all duration-300 flex items-center gap-1.5 order-1 sm:order-2 ${
                files.length > 0 
                  ? "btn-primary bg-gradient-to-r from-primary to-secondary text-primary-content hover:shadow-lg hover:shadow-primary/20 hover:opacity-95 border-0" 
                  : "btn-disabled bg-base-200 text-base-content/40 border-0"
              }`}
              suppressHydrationWarning={true}
            >
              {pending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Uploading...
                </>
              ) : (
                <>
                  Upload Agent Skill
                  <Upload className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
