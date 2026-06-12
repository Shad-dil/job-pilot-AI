import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./Providers";
import Navbar from "@/components/Navbar"; // 1. Import your fixed Navbar

export const metadata: Metadata = {
  title: "JobPilot AI — Resume Intelligence for Smarter Applications",
  description:
    "Upload your resume and job description. JobPilot AI tells you exactly what's working, what's missing, and how to close the gap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* 2. Render the Navbar globally */}
          <Navbar />

          {/* 3. Since your navbar is "fixed", it floats over the content.
               If page content gets cut off at the very top, you can wrap {children} 
               in a div with top padding (e.g., pt-20), or handle it inside the pages.
          */}
          <div>{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
