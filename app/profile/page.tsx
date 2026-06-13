"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setName(user.name || "");
          setAvatarUrl(user.avatarUrl || "");
        } catch (e) {
          // ignore
        }
      } else {
        // If not logged in, redirect
        router.push("/login");
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setLoading(true);

    // Simulate API request delay
    setTimeout(() => {
      setLoading(false);
      
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
          avatarUrl,
        })
      );
      
      // Dispatch custom event to let other components (like Header) know
      window.dispatchEvent(new Event("storage"));
      
      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    }, 800);
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
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
                  <span className="label-text font-semibold text-base-content/85">Profile Picture URL</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-200/50 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                  />
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
