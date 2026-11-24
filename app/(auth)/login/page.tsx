"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { safeRedirect } from "@/features/auth/safe-redirect";
import { useSetViewer } from "@/features/auth/viewer";
import GoogleButton from "@/components/GoogleButton";

type LoginPageProps = {
  searchParams: Promise<{ email?: string | string[]; redirect?: string | string[] }>;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default function LoginPage({ searchParams }: LoginPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  const setViewer = useSetViewer();
  const [email, setEmail] = useState(first(params.email) ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
      const result = await loginAction({ email, password });

      if (result.ok) {
        setSuccess("Logged in, redirecting");
        setViewer(result.viewer);
        setTimeout(() => router.push(safeRedirect(first(params.redirect))), 1200);
      } else {
        setError(result.error || "Wrong email or password");
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
        <h1 className="font-heading text-2xl font-medium text-foreground">Log in to Tackbox</h1>
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
          <GoogleButton mode="logIn" redirectTo={first(params.redirect)} />
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
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
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

          <button type="submit" disabled={loading} className="btn btn-primary mt-2 h-10 w-full gap-2 text-sm">
            {loading && <span className="loading loading-spinner loading-xs" />}
            {loading ? "Logging in" : "Log in"}
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
