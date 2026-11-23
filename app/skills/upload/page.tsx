"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createSkill } from "@/features/skills/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";
import { AlertTriangle, ArrowLeft, FileText, FileUp } from "lucide-react";
import SkillMetaFields from "@/components/SkillMetaFields";

type UploadedFile = {
  name: string;
  size: number;
  content: string;
};

const initialState = { message: "" };

export default function UploadSkillPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createSkill, initialState);
  const [files, setFiles] = useState<UploadedFile[]>([]);
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

  // The first file becomes the skill, the rest are bundled with it
  const handleFormAction = (formData: FormData) => {
    if (files.length === 0) return;
    formData.set("mainContent", files[0].content);
    const subSkillsData = files.slice(1).map((f) => ({ title: f.name, content: f.content }));
    formData.set("subSkillsData", JSON.stringify(subSkillsData));
    return formAction(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise<UploadedFile>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ name: file.name, size: file.size, content: ev.target?.result as string });
            reader.readAsText(file);
          })
      )
    ).then(setFiles);
  };

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
        <h1 className="font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
          Upload a skill
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-subtle">
          Already have a skill file? Upload it, then add a name, category and description.
        </p>
      </header>

      <form action={handleFormAction} className="mt-8 flex flex-col gap-8">
        <SkillMetaFields disabled={pending} />

        <div className="flex flex-col gap-2">
          <span id="files-label" className="field-label">
            Skill files
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".md,.txt,.js,.ts,.json"
            multiple
            onChange={handleFileChange}
            disabled={pending}
          />
          <button
            type="button"
            aria-labelledby="files-label"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong px-6 py-10 text-center transition-colors duration-150 ease-out hover:bg-card"
          >
            <span className="grid size-10 place-items-center rounded-lg border border-line bg-raised">
              <FileUp className="size-4 text-subtle" strokeWidth={1.5} />
            </span>
            <span className="text-sm text-foreground">{files.length > 0 ? "Choose different files" : "Choose files"}</span>
            <span className="max-w-sm text-[13px] leading-5 text-muted">
              .md, .txt, .js, .ts or .json. The first file becomes the skill, any others are bundled with it.
            </span>
          </button>

          {files.length > 0 && (
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex h-11 items-center gap-3 px-4">
                  <FileText className="size-4 shrink-0 text-muted" strokeWidth={1.5} />
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground" title={f.name}>
                    {f.name}
                  </span>
                  {i === 0 && files.length > 1 && <span className="tag">Main skill</span>}
                  <span className="font-mono text-xs tabular-nums text-muted">{(f.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          )}
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
          <button type="submit" disabled={pending || files.length === 0} className="btn btn-primary h-10 gap-2 px-4 text-sm">
            {pending && <span className="loading loading-spinner loading-xs" />}
            {pending ? "Uploading" : "Upload skill"}
          </button>
        </div>
      </form>
    </main>
  );
}
