"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-base-900 to-base-950 relative overflow-hidden">
      {/* Decorative radial gradients for aesthetic look */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

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
                Create Account
              </h2>
              <p className="text-base-content/60 text-sm mt-2">
                Join Skillhub and start cataloging your skills
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/85">Full Name</span>
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
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-300/30 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

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
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/85">Password</span>
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
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.852 0a9 9 0 0 0 18.704 0m-18.704 0a3 3 0 1 1 18.704 0M7.5 10.5h9"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="•••••••• (Min. 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-300/30 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/85">Confirm Password</span>
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
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.852 0a9 9 0 0 0 18.704 0m-18.704 0a3 3 0 1 1 18.704 0M7.5 10.5h9"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-bordered w-full pl-11 bg-base-300/30 border-base-300 hover:border-primary/50 focus:border-primary focus:outline-none rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="form-control flex flex-row items-start gap-2 mt-3">
                <input
                  type="checkbox"
                  id="agree-terms"
                  className="checkbox checkbox-primary checkbox-xs rounded mt-0.5"
                  required
                />
                <label htmlFor="agree-terms" className="label-text cursor-pointer select-none text-base-content/60 text-xs leading-normal">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-primary-content shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="text-center mt-8 pt-6 border-t border-base-200/40 text-sm">
              <span className="text-base-content/50">Already have an account? </span>
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}