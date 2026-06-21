"use client";
import { loginSchema, signupSchema } from "@/app/auth/signin/schema";
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
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const handleSignIn = async (data: { email: string; password: string }) => {
    console.log(data);
    try {
      setIsloading(true);
      setError("");
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.ok) {
        console.log("Redirecting to:", callbackUrl); // ← check this
        router.push(callbackUrl); // ← use callbackUrl, not hardcoded "/dashboard"
      } else {
        setError("Invalid email or password");
      }
    } catch {
    } finally {
      setIsloading(false);
    }
  };

  return (
    <>
      {showForgotPassword ? (
        <div>
          <Card>
            <CardTitle className="flex justify-around">
              <div>Forgot Password</div>
              <p onClick={() => setShowForgotPassword(false)}>
                <X className="h-4 w-4 cursor-pointer" />
              </p>
            </CardTitle>
            <CardContent className="flex justify-center items-center">
              <Construction className="h-20 w-20 " />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
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
          <form
            onSubmit={handleSubmit(handleSignIn, (errors) =>
              console.log("Validation errors:", errors),
            )}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                  Email
                </label>
                <input
                  type={"email"}
                  {...register("email")}
                  placeholder={"you@example.com"}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    fontSize: 14,
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--white)",
                    border: `1px solid rgba(255,255,255,0.1)`,
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "Inter,sans-serif",
                  }}
                />
                {errors.email && (
                  <p className="text-xs text-stone-100">
                    {errors.email.message}
                  </p>
                )}
              </div>
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
                  Password
                </label>
                <input
                  type={"password"}
                  {...register("password")}
                  placeholder={"Enter Your Password"}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    fontSize: 14,
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--white)",
                    border: `1px solid rgba(255,255,255,0.1)`,
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "Inter,sans-serif",
                  }}
                />
                {errors.password && (
                  <p className="text-xs text-stone-100">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
            >
              {isLoading ? (
                <>
                  <span className="spinner" /> Signing...
                </>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>
          <p
            style={{
              textAlign: "left",
              fontSize: 12,
              color: "var(--slate)",
              marginTop: 16,
            }}
          >
            <button
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: "none",
                border: "none",
                color: "#818CF8",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              forgot password
            </button>
          </p>
        </div>
      )}
    </>
  );
};

export default SignInForm;
