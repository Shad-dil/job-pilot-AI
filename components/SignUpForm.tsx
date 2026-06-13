import { registerUser } from "@/app/actions/registerUser";
import { signupSchema } from "@/app/auth/signin/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type SignUpFormData = z.infer<typeof signupSchema>;
const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
  });
  const [isLoading, setIsloading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const router = useRouter();

  const submitData = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      setIsloading(true);
      reset();
      const { success, user, error } = await registerUser(data);
      if (error) {
        setSignupError(error);
        setIsloading(false);
        return;
      }
      if (success) {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        if (result?.error) {
          setSignupError("Account created but login failed. Please sign in.");
          setIsloading(false);
          return;
        }
        router.push("/dashboard");
      }
    } catch {
    } finally {
      setIsloading(false);
    }
  };
  return (
    <>
      {signupError && (
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
          {signupError}
        </div>
      )}
      <form onSubmit={handleSubmit(submitData)}>
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
              Full Name
            </label>
            <input
              type={"text"}
              {...register("name")}
              placeholder={"John Doe"}
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
            {errors.name && (
              <p className="text-xs text-stone-100">{errors.name.message}</p>
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
              <p className="text-xs text-stone-100">{errors.email.message}</p>
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
              placeholder={"Create a strong Password"}
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
              <span className="spinner" /> Creating account...
            </>
          ) : (
            <span>Create Account →</span>
          )}
        </button>
      </form>
    </>
  );
};

export default SignUpForm;
