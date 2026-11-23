"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeRedirect } from "@/lib/safe-redirect";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AlertTriangle, Check } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill the email when coming from registration
  useEffect(() => {
    const registeredEmail = new URLSearchParams(window.location.search).get("email");
    if (registeredEmail) setEmail(registeredEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginAction(null, formData);

      if (result?.success) {
        setSuccess("Signed in, redirecting");
        localStorage.setItem("user", JSON.stringify(result.user));
        // Let the header know the user changed
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          const redirectUrl = safeRedirect(new URLSearchParams(window.location.search).get("redirect"));
          router.push(redirectUrl);
        }, 1200);
      } else {
        setError(result?.message || "Wrong email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px] rounded-2xl border border-line bg-card p-8">
        <h1 className="font-heading text-2xl font-medium text-foreground">Sign in to Tackbox</h1>
        <p className="mt-2 text-sm text-subtle">Publish skills and manage the ones you&apos;ve written</p>

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-2 rounded-[10px] border border-negative/20 bg-negative/10 px-3 py-2.5 text-[13px] leading-5 text-negative">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="mt-6 flex items-start gap-2 rounded-[10px] border border-positive/20 bg-positive/10 px-3 py-2.5 text-[13px] leading-5 text-positive">
            <Check className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-6">
          <GoogleButton mode="signIn" />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="field-label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field h-10 px-3"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <a href="#" className="text-xs text-muted transition-colors duration-150 ease-out hover:text-foreground">
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field h-10 px-3"
              required
            />
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-subtle">
            <input type="checkbox" className="size-4 accent-amber" />
            Remember this device
          </label>

          <button type="submit" disabled={loading} className="btn btn-primary mt-2 h-10 w-full gap-2 text-sm">
            {loading && <span className="loading loading-spinner loading-xs" />}
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
