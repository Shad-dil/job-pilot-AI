"use client";
import { loginSchema } from "@/app/auth/signin/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Construction, X } from "lucide-react";

type LoginFormData = z.infer<typeof loginSchema>;

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ← Read callbackUrl ONCE and keep it stable
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSignIn = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(""); // ← clear previous error

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // ← never let NextAuth redirect
      });

      console.log("SignIn result:", res);
      console.log("Redirecting to:", callbackUrl);

      if (res?.ok && !res?.error) {
        // ← refresh session then redirect
        router.refresh();
        router.push(callbackUrl);
      } else {
        // ← show error, stay on page, callbackUrl still in state
        setError(
          res?.error === "CredentialsSignin"
            ? "Invalid email or password. Please try again."
            : res?.error || "Something went wrong. Please try again.",
        );
      }
    } catch (e) {
      console.error("SignIn error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <Card>
        <CardTitle className="flex justify-around">
          <div>Forgot Password</div>
          <p onClick={() => setShowForgotPassword(false)}>
            <X className="h-4 w-4 cursor-pointer" />
          </p>
        </CardTitle>
        <CardContent className="flex justify-center items-center">
          <Construction className="h-20 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Error message */}
      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-sm border"
          style={{
            background: "rgba(239,68,68,0.1)",
            borderColor: "rgba(239,68,68,0.25)",
            color: "#EF4444",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleSignIn, (errs) =>
          console.log("Validation errors:", errs),
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--slate)" }}
            >
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "var(--white)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "Inter,sans-serif",
              }}
            />
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--slate)" }}
            >
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "var(--white)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "Inter,sans-serif",
              }}
            />
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          style={{
            background: "linear-gradient(135deg,#6366F1,#818CF8)",
            fontFamily: "Space Grotesk,sans-serif",
          }}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
              Signing in...
            </>
          ) : (
            "Sign In →"
          )}
        </button>
      </form>

      {/* Forgot password */}
      <button
        onClick={() => setShowForgotPassword(true)}
        className="mt-4 text-xs font-semibold"
        style={{
          background: "none",
          border: "none",
          color: "#818CF8",
          cursor: "pointer",
        }}
      >
        Forgot password?
      </button>
    </div>
  );
};

export default SignInForm;
