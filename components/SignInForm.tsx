import { loginSchema, signupSchema } from "@/app/auth/signin/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const submitData = () => {
    // console.log(data);
  };

  return (
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
            <p className="text-xs text-stone-100">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" /> Signing...
          </>
        ) : (
          <span>Sign In →</span>
        )}
      </button>
    </form>
  );
};

export default SignInForm;
