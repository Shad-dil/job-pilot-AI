"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    urlError === "OAuthAccountNotLinked"
      ? "This email is already registered with a different provider."
      : "",
  );

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl });
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

          {mode === "signin" ? <SignInForm /> : <SignUpForm />}

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
