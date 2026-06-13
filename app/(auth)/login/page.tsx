"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email if coming from register redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const registeredEmail = searchParams.get("email");
      if (registeredEmail) {
        setEmail(registeredEmail);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginAction(null, formData);

      if (result?.success) {
        setSuccess("Login successful! Redirecting...");
        
        // Save user session
        localStorage.setItem(
          "user",
          JSON.stringify(result.user)
        );
        
        // Dispatch custom event to let other components (like Header) know
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get("redirect") || "/my-skills";
          router.push(redirectUrl);
        }, 1200);
      } else {
        setError(result?.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoCredentials = () => {
    setEmail("demo@skillhub.com");
    setPassword("Password123");
    setError("");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-base-900 to-base-950 relative overflow-hidden">
      {/* Decorative radial gradients for aesthetic look */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Card Container */}
        <div className="card bg-base-200/40 backdrop-blur-xl border border-base-200/60 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
          <div className="card-body p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg shadow-primary/20 mb-4">
                <span className="text-2xl font-black">S</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
                Welcome back
              </h2>
              <p className="text-base-content/60 text-sm mt-2">
                Sign in to your Skillhub account
              </p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="alert alert-error text-sm py-3 px-4 rounded-xl border border-error/20 bg-error/10 text-error-content mb-6 flex items-start gap-2 shadow-sm animate-shake">
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
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

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
                  <span className="label-text font-semibold text-base-content/85">Email Address</span>
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
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-300/30 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <div className="flex justify-between items-center py-1">
                  <label className="label p-0">
                    <span className="label-text font-semibold text-base-content/85">Password</span>
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
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
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.852 0a9 9 0 0 0 18.704 0m-18.704 0a3 3 0 1 1 18.704 0M7.5 10.5h9"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-300/30 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="form-control flex flex-row items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="checkbox checkbox-primary checkbox-xs rounded"
                />
                <label htmlFor="remember-me" className="label-text cursor-pointer select-none text-base-content/60 font-medium">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-primary-content shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Demo Credentials Alert Helper */}
            <div className="mt-6 p-4 rounded-xl bg-base-300/40 border border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-primary flex items-center gap-1 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Demo User Account
                </span>
                <p className="text-base-content/60">
                  Email: <span className="font-mono text-base-content">demo@skillhub.com</span>
                </p>
                <p className="text-base-content/60">
                  Pass: <span className="font-mono text-base-content">Password123</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="btn btn-xs btn-outline btn-primary rounded-lg text-[10px] self-start sm:self-auto"
              >
                Autofill
              </button>
            </div>

            {/* Bottom Link */}
            <div className="text-center mt-8 pt-6 border-t border-base-200/40 text-sm">
              <span className="text-base-content/50">Don't have an account? </span>
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}