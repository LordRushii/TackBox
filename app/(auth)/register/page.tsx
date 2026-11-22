"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { AlertTriangle, Check } from "lucide-react";
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
      setError("Fill in every field");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for the password");
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
        setSuccess("Account created, taking you to sign in");
        setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}`), 1500);
      } else {
        setError(result?.message || "Couldn't create the account. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "register-name", label: "Name", type: "text", value: name, set: setName, autoComplete: "name", placeholder: "" },
    { id: "register-email", label: "Email", type: "email", value: email, set: setEmail, autoComplete: "email", placeholder: "you@example.com" },
    { id: "register-password", label: "Password", type: "password", value: password, set: setPassword, autoComplete: "new-password", placeholder: "At least 8 characters" },
    { id: "register-confirm", label: "Confirm password", type: "password", value: confirmPassword, set: setConfirmPassword, autoComplete: "new-password", placeholder: "" },
  ];

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px] rounded-2xl border border-line bg-card p-8">
        <h1 className="font-heading text-2xl font-medium text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-subtle">Publish skills under your own name</p>

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
          <GoogleButton mode="signUp" />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.id} className="flex flex-col gap-2">
              <label htmlFor={f.id} className="field-label">
                {f.label}
              </label>
              <input
                id={f.id}
                type={f.type}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder || undefined}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="field h-10 px-3"
                required
              />
            </div>
          ))}

          <label className="flex cursor-pointer select-none items-start gap-2 text-[13px] leading-5 text-subtle">
            <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-amber" required />
            <span>
              I agree to the{" "}
              <a href="#" className="text-foreground underline-offset-4 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-foreground underline-offset-4 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          <button type="submit" disabled={loading} className="btn btn-primary mt-2 h-10 w-full gap-2 text-sm">
            {loading && <span className="loading loading-spinner loading-xs" />}
            {loading ? "Creating account" : "Create account"}
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
