"use client";

import { useActionState, useState, useEffect } from "react";
import { createSkill } from "@/app/actions/skills";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";

const initialState = {
  message: "",
};

export default function NewSkillPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createSkill, initialState);
  const [descLength, setDescLength] = useState(0);
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

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

  const lineCount = content.split("\n").length;

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
        <form action={formAction} className="card-body p-6 sm:p-8 md:p-10 gap-6">
          
          {/* Row 1: Skill Name, Category, Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Skill Name */}
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
              />
            </div>

            {/* Category */}
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

            {/* Visibility */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Visibility</span>
              </label>
              <div className="dropdown w-full dropdown-bottom dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-outline border-base-200/50 hover:bg-base-200/20 w-full flex items-center justify-between px-4 py-2.5 h-auto font-normal text-left min-h-12 bg-base-100/30 hover:border-primary/20"
                >
                  <div className="flex items-center gap-2.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-primary shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253"
                      />
                    </svg>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm text-base-content/95 leading-none">
                        {visibility === "public" ? "Public" : "Private"}
                      </span>
                      <span className="text-[10px] text-base-content/50 leading-none">
                        {visibility === "public" ? "Anyone can view this skill" : "Only you can view this skill"}
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-base-content/40 shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-300 rounded-xl z-50 w-full p-1.5 shadow-xl border border-base-200/50 mt-1"
                >
                  <li>
                    <button
                      type="button"
                      onClick={() => setVisibility("public")}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-left ${visibility === "public" ? "active bg-primary/20" : "hover:bg-base-200/60"}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-base-content/90">Public</span>
                        <span className="text-xs text-base-content/50">Anyone can view this skill</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setVisibility("private")}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-left ${visibility === "private" ? "active bg-primary/20" : "hover:bg-base-200/60"}`}
                    >
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

          {/* Row 2: Description */}
          <div className="form-control w-full relative">
            <div className="flex justify-between items-baseline mb-1">
              <label className="label p-0">
                <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Description</span>
              </label>
              <span className="text-xs text-base-content/40 tracking-wider">
                {descLength}/200
              </span>
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
            />
          </div>

          {/* Row 3: Skill Content Editor */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Agent Execution Instructions / Prompt</span>
            </label>
            
            {/* Tab Toolbar frame */}
            <div className="border border-base-200/50 rounded-t-xl bg-base-250/20 flex items-center justify-between px-3 py-2 gap-3 border-b-0">
              {/* Tab options */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === "write"
                      ? "border border-primary/50 bg-primary/10 text-primary"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-200/40"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === "preview"
                      ? "border border-primary/50 bg-primary/10 text-primary"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-200/40"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  Preview
                </button>
              </div>

              {/* Toolbar Dropdowns (Right Side) */}
              <div className="flex flex-row items-center gap-1.5">
                <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none">
                  <option>Markdown</option>
                </select>
                <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none">
                  <option>Spaces</option>
                </select>
                <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none">
                  <option>2</option>
                </select>
                <select className="select select-bordered select-xs w-auto rounded-md bg-base-100/20 text-[11px] h-7 min-h-7 border-base-200/50 text-base-content/60 font-semibold focus:outline-none">
                  <option>No wrap</option>
                </select>
                <div className="divider divider-horizontal mx-1 my-2"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 text-base-content/40 hover:text-base-content/70 cursor-pointer transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0-5.25-5.25"
                  />
                </svg>
              </div>
            </div>

            {/* Input body box */}
            {activeTab === "write" ? (
              <div className="flex min-h-[220px] border border-base-200/50 rounded-b-xl bg-base-300/15 font-mono text-sm overflow-hidden shadow-inner">
                {/* Line numbers column */}
                <div className="bg-base-200/15 text-base-content/25 py-4 px-3 select-none text-right border-r border-base-200/30 flex flex-col min-w-[3.25rem] leading-relaxed">
                  {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Textarea */}
                <textarea
                  name="subSkills"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your skill content here in Markdown..."
                  className="flex-1 bg-transparent py-4 px-4 outline-none resize-none text-base-content/90 font-mono focus:ring-0 leading-relaxed min-h-[220px]"
                  disabled={pending}
                />
              </div>
            ) : (
              <div className="flex-1 min-h-[220px] border border-base-200/50 rounded-b-xl bg-base-300/10 p-6 prose max-w-none text-base-content/80 shadow-inner">
                {content ? (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed text-sm">
                    {content}
                  </div>
                ) : (
                  <span className="text-base-content/30 italic text-sm">Nothing to preview yet. Write content in the write tab.</span>
                )}
              </div>
            )}

            {/* Tooltip & Help guides */}
            <div className="flex justify-between items-center text-[11px] mt-2.5 px-1 text-base-content/50">
              <span className="flex items-center gap-1">
                💡 Tip: Use Markdown for better formatting. You can preview your content anytime.
              </span>
              <a
                href="https://www.markdownguide.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 font-semibold text-primary/80 hover:text-primary transition-colors"
              >
                Markdown Guide
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Error feedback banner */}
          {state?.message && (
            <div className="alert alert-error text-sm py-2.5 px-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-2 mt-1 animate-fadeIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12v-.008Z"
                />
              </svg>
              <span>{state.message}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-base-200/30">
            <Link
              href="/my-skills"
              className="btn btn-outline border-base-200/50 hover:bg-base-200/20 px-6 font-semibold transition-all duration-200 order-2 sm:order-1"
            >
              Cancel & Return
            </Link>

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary text-primary-content hover:shadow-lg hover:shadow-primary/20 hover:opacity-95 border-0 px-8 font-semibold transition-all duration-300 flex items-center gap-1.5 order-1 sm:order-2"
            >
              {pending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Creating Agent Skill...
                </>
              ) : (
                <>
                  Create Agent Skill
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L6 12Zm0 0h7.5"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
