"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AlertTriangle, CheckCircle2, Mail, Lock } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

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
        localStorage.setItem("user", JSON.stringify(result.user));

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
              <div className="flex justify-center mb-6">
                <div className="w-48 sm:w-56 h-14 overflow-hidden flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Tackbox Logo"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
                Welcome back
              </h2>
              <p className="text-base-content/60 text-sm mt-2">
                Sign in to your Tackbox account
              </p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="alert alert-error text-sm py-3 px-4 rounded-xl border border-error/20 bg-error/10 text-error-content mb-6 flex items-start gap-2 shadow-sm animate-shake">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success text-sm py-3 px-4 rounded-xl border border-success/20 bg-success/10 text-success-content mb-6 flex items-start gap-2 shadow-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Google Auth */}
            <GoogleButton mode="signIn" />

            <div className="divider text-xs text-base-content/40 font-medium py-2">
              OR CONTINUE WITH EMAIL
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/85">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <Mail className="w-5 h-5" />
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
                    <span className="label-text font-semibold text-base-content/85">
                      Password
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <Lock className="w-5 h-5" />
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
                <label
                  htmlFor="remember-me"
                  className="label-text cursor-pointer select-none text-base-content/60 font-medium"
                >
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

            {/* Bottom Link */}
            <div className="text-center mt-8 pt-6 border-t border-base-200/40 text-sm">
              <span className="text-base-content/50">
                Don't have an account?{" "}
              </span>
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
