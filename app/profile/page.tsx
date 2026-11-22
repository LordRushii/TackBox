"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, updateProfileAction } from "@/app/actions/auth";
import { Check } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function syncSession() {
      try {
        const dbUser = await getCurrentUserAction();
        if (!dbUser) {
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        setName(dbUser.name || "");
        setAvatarUrl(dbUser.image || "");
        localStorage.setItem("user", JSON.stringify(dbUser));
      } catch (e) {
        console.error(e);
      }
    }
    syncSession();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setLoading(true);

    try {
      const result = await updateProfileAction(name, avatarUrl);
      if (result?.success) {
        const stored = localStorage.getItem("user");
        let userObj = { role: "Member" };
        if (stored) {
          try {
            userObj = JSON.parse(stored);
          } catch {}
        }
        localStorage.setItem("user", JSON.stringify({ ...userObj, name, image: avatarUrl }));
        // Let the header know the user changed
        window.dispatchEvent(new Event("storage"));

        setSuccess("Profile saved");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[560px] flex-1 px-6 pb-24 pt-12">
      <h1 className="font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">Profile</h1>
      <p className="mt-2 text-[15px] leading-6 text-subtle">Your name and picture show on every skill you publish</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6 rounded-2xl border border-line bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-raised">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="font-heading text-2xl font-medium text-subtle">{name ? name.charAt(0).toUpperCase() : "?"}</span>
            )}
          </span>
          <div className="flex flex-col gap-2">
            <span className="field-label">Picture</span>
            <div className="flex gap-2">
              <label className="btn btn-secondary h-9 cursor-pointer px-3 text-sm has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-amber">
                Upload image
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
              </label>
              {avatarUrl && (
                <button type="button" onClick={() => setAvatarUrl("")} className="btn btn-quiet h-9 px-3 text-sm">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-name" className="field-label">
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field h-10 px-3"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-line pt-6">
          {success && (
            <span role="status" className="flex items-center gap-2 text-[13px] text-positive">
              <Check className="size-4" strokeWidth={1.5} />
              {success}
            </span>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary h-10 gap-2 px-4 text-sm">
            {loading && <span className="loading loading-spinner loading-xs" />}
            {loading ? "Saving" : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
