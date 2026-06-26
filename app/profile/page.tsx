"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, updateProfileAction } from "@/app/actions/auth";
import { CheckCircle2, User, X } from "lucide-react";

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setLoading(true);

    try {
      const result = await updateProfileAction(name, avatarUrl);
      if (result?.success) {
        // Save updated user session
        const stored = localStorage.getItem("user");
        let userObj = { role: "Member" };
        if (stored) {
          try {
             userObj = JSON.parse(stored);
          } catch (e) {}
        }

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...userObj,
            name,
            image: avatarUrl,
          })
        );
        
        // Dispatch custom event to let other components (like Header) know
        window.dispatchEvent(new Event("storage"));
        
        setSuccess("Profile updated successfully!");

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-background">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="w-full max-w-lg z-10">
        <div className="bg-white/[0.02] border border-white/10 shadow-2xl shadow-black rounded-lg overflow-hidden transition-all duration-300">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10 flex flex-col items-center">
              <div className="h-24 w-24 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-foreground shadow-sm mb-6 overflow-hidden">
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                   <span className="text-4xl font-heading font-semibold">{name ? name.charAt(0).toUpperCase() : 'U'}</span>
                 )}
              </div>
              <h2 className="text-3xl font-heading font-semibold tracking-tight text-foreground">
                Edit Profile
              </h2>
              <p className="text-foreground/60 text-sm mt-2">
                Update your personal information
              </p>
            </div>

            {/* Status Messages */}
            {success && (
              <div className="text-sm py-3 px-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-foreground/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white/[0.04] file:text-foreground hover:file:bg-white/[0.08] cursor-pointer"
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="p-2 rounded-md hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition-colors"
                      title="Remove Profile Picture"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 flex items-center justify-center rounded-md bg-white text-[#0A0A0A] hover:bg-white/90 text-sm font-medium transition-all gap-2"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-xs border-current border-t-transparent"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
