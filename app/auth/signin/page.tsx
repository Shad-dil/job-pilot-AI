import { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </main>
    }>
      <SignInClient />
    </Suspense>
  );
}
