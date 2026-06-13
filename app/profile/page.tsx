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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative radial gradients for aesthetic look */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <div className="card bg-base-100/60 backdrop-blur-xl border border-base-200 shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
          <div className="card-body p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg shadow-primary/20 mb-4 overflow-hidden ring-4 ring-base-100">
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                   <span className="text-4xl font-black">{name ? name.charAt(0).toUpperCase() : 'U'}</span>
                 )}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
                Edit Profile
              </h2>
              <p className="text-base-content/60 text-sm mt-2">
                Update your personal information
              </p>
            </div>

            {/* Status Messages */}
            {success && (
              <div className="alert alert-success text-sm py-3 px-4 rounded-xl border border-success/20 bg-success/10 text-success-content mb-6 flex items-start gap-2 shadow-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/85">Full Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-200/50 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/85">Profile Picture</span>
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-primary w-full bg-base-200/50 border-base-300 hover:border-primary/50 transition-all duration-200 rounded-xl"
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="btn btn-circle btn-sm btn-ghost text-error"
                      title="Remove Profile Picture"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-primary-content shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
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
