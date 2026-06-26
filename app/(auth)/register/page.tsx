"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { CheckCircle2, AlertTriangle, User, Mail, Lock } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const result = await registerAction(null, formData);

      if (result?.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(result?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="w-full max-w-md z-10">
        {/* Card Container */}
        <div className="bg-white/[0.02] border border-white/10 shadow-2xl shadow-black rounded-lg overflow-hidden">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-36 h-8 overflow-hidden flex items-center justify-center mb-6">
                <img
                  src="/logo.png"
                  alt="Tackbox Logo"
                  className="w-full h-full object-contain object-center"
                />
              </div>
              <h2 className="text-3xl font-heading font-semibold tracking-tight text-foreground">
                Create Account
              </h2>
              <p className="text-foreground/60 text-sm mt-2">
                Join Tackbox and start cataloging your skills
              </p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="text-sm py-3 px-4 rounded-md border border-red-500/20 bg-red-500/10 text-red-500 mb-6 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="text-sm py-3 px-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Google Auth */}
            <GoogleButton mode="signUp" />

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-medium">
                <span className="bg-[#0A0A0A] px-2 text-foreground/40">OR CONTINUE WITH EMAIL</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="•••••••• (Min. 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-foreground/80 text-[11px] uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-md bg-[#0A0A0A] border border-white/10 focus:border-white/20 text-sm text-foreground focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 mt-4">
                <input
                  type="checkbox"
                  id="agree-terms"
                  className="rounded bg-[#0A0A0A] border-white/10 text-amber-500 focus:ring-amber-500 focus:ring-offset-[#0A0A0A] mt-0.5"
                  required
                />
                <label
                  htmlFor="agree-terms"
                  className="cursor-pointer select-none text-foreground/60 text-xs leading-relaxed"
                >
                  I agree to the{" "}
                  <a href="#" className="text-amber-500 hover:text-amber-400 transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-amber-500 hover:text-amber-400 transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-6 flex items-center justify-center rounded-md bg-white text-[#0A0A0A] hover:bg-white/90 text-sm font-medium transition-all gap-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs border-current border-t-transparent"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="text-center mt-8 pt-6 border-t border-white/10 text-sm">
              <span className="text-foreground/50">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-amber-500 font-medium hover:text-amber-400 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
