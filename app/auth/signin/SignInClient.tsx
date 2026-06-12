"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/analyze";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    urlError === "OAuthAccountNotLinked"
      ? "This email is already registered with a different provider."
      : "",
  );

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError(friendlyError(res.error));
    else router.push(callbackUrl);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      const signin = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      setLoading(false);
      if (signin?.error) setError(friendlyError(signin.error));
      else router.push(callbackUrl);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const friendlyError = (e: string) => {
    if (e.includes("No account")) return "No account found with this email.";
    if (e.includes("Incorrect")) return "Incorrect password. Please try again.";
    return "Something went wrong. Please try again.";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-deep)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#818CF8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈</div>
        <span style={{ fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, fontSize: 20, color: "var(--white)" }}>
          JobPilot <span style={{ color: "#818CF8" }}>AI</span>
        </span>
      </Link> */}

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1px solid rgba(99,102,241,0.22)",
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              style={{
                padding: "16px 0",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background:
                  mode === m ? "rgba(99,102,241,0.12)" : "transparent",
                color: mode === m ? "#818CF8" : "var(--slate)",
                borderBottom:
                  mode === m ? "2px solid #6366F1" : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div style={{ padding: 32 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#EF4444",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--white)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {googleLoading ? <span className="spinner" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--slate)" }}>
              or with email
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && (
                <Field
                  label="Full Name"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(v) => set("name", v)}
                />
              )}
              <Field
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(v) => set("email", v)}
              />
              <Field
                label="Password"
                type="password"
                placeholder={
                  mode === "signup" ? "Min. 6 characters" : "Your password"
                }
                value={form.password}
                onChange={(v) => set("password", v)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />{" "}
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "signin" ? (
                "Sign In →"
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          {mode === "signin" && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--slate)",
                marginTop: 16,
              }}
            >
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#818CF8",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Sign up free
              </button>
            </p>
          )}
        </div>
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "var(--slate)",
          textAlign: "center",
        }}
      >
        By continuing, you agree to our{" "}
        <a href="#" style={{ color: "#818CF8" }}>
          Terms
        </a>{" "}
        and{" "}
        <a href="#" style={{ color: "#818CF8" }}>
          Privacy Policy
        </a>
      </p>
    </main>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--slate)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          fontSize: 14,
          background: "rgba(255,255,255,0.04)",
          color: "var(--white)",
          border: `1px solid ${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
          outline: "none",
          transition: "border-color 0.2s",
          fontFamily: "Inter,sans-serif",
        }}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
