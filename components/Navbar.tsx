"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // ← new

  return (
    <nav className="jp-nav">
      <div className="jp-nav-inner">
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#6366F1,#818CF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ✈
          </div>
          <span
            style={{
              fontFamily: "Space Grotesk,sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--white)",
            }}
          >
            JobPilot <span style={{ color: "#818CF8" }}>AI</span>
          </span>
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div
          className="nav-desktop-links"
          style={{ display: "flex", alignItems: "center", gap: 20 }}
        >
          <Link
            href="/#how"
            style={{
              fontSize: 14,
              color: "var(--slate)",
              textDecoration: "none",
            }}
          >
            How it works
          </Link>
          <Link
            href="/#features"
            style={{
              fontSize: 14,
              color: "var(--slate)",
              textDecoration: "none",
            }}
          >
            Features
          </Link>

          {status === "loading" ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          ) : session ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={34}
                    height={34}
                    style={{
                      borderRadius: "50%",
                      border: "2px solid rgba(99,102,241,0.4)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366F1,#818CF8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--white)",
                    fontWeight: 500,
                  }}
                >
                  {session.user?.name?.split(" ")[0]}
                </span>
                <span style={{ color: "var(--slate)", fontSize: 10 }}>▼</span>
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    background: "var(--bg-card)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 12,
                    padding: 6,
                    minWidth: 180,
                    zIndex: 200,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      marginBottom: 4,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--white)",
                      }}
                    >
                      {session.user?.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--slate)" }}>
                      {session.user?.email}
                    </p>
                  </div>
                  <MenuLink
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    📊 Dashboard
                  </MenuLink>
                  <MenuLink href="/analyze" onClick={() => setMenuOpen(false)}>
                    🔍 New Analysis
                  </MenuLink>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: "none",
                      border: "none",
                      color: "#EF4444",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Inter,sans-serif",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/auth/signin"
                style={{
                  fontSize: 14,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--slate)",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signin"
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: 14 }}
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile right side */}
        <div
          className="nav-mobile-right"
          style={{ display: "none", alignItems: "center", gap: 10 }}
        >
          {/* Show Get started OR avatar on mobile */}
          {session ? (
            session.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                style={{
                  borderRadius: "50%",
                  border: "2px solid rgba(99,102,241,0.4)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366F1,#818CF8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {session.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )
          ) : (
            <Link
              href="/auth/signin"
              className="btn-primary"
              style={{ padding: "7px 14px", fontSize: 13 }}
            >
              Get started
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 4,
              padding: 0,
            }}
          >
            {mobileOpen ? (
              <span style={{ color: "#818CF8", fontSize: 18, lineHeight: 1 }}>
                ✕
              </span>
            ) : (
              <>
                <div
                  style={{
                    width: 16,
                    height: 1.5,
                    background: "var(--slate)",
                    borderRadius: 2,
                  }}
                />
                <div
                  style={{
                    width: 16,
                    height: 1.5,
                    background: "var(--slate)",
                    borderRadius: 2,
                  }}
                />
                <div
                  style={{
                    width: 16,
                    height: 1.5,
                    background: "var(--slate)",
                    borderRadius: 2,
                  }}
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "12px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <MobileLink href="/#how" onClick={() => setMobileOpen(false)}>
            How it works
          </MobileLink>
          <MobileLink href="/#features" onClick={() => setMobileOpen(false)}>
            Features
          </MobileLink>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.07)",
              margin: "6px 0",
            }}
          />
          {session ? (
            <>
              <div style={{ padding: "8px 12px", marginBottom: 4 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--white)",
                    margin: 0,
                  }}
                >
                  {session.user?.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--slate)", margin: 0 }}>
                  {session.user?.email}
                </p>
              </div>
              <MobileLink
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
              >
                📊 Dashboard
              </MobileLink>
              <MobileLink href="/analyze" onClick={() => setMobileOpen(false)}>
                🔍 New Analysis
              </MobileLink>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "none",
                  border: "none",
                  color: "#EF4444",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <MobileLink
                href="/auth/signin"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </MobileLink>
              <Link
                href="/auth/signin"
                className="btn-primary"
                style={{ textAlign: "center", marginTop: 4 }}
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-right { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "9px 12px",
        borderRadius: 8,
        fontSize: 13,
        color: "var(--white)",
        textDecoration: "none",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.background = "rgba(99,102,241,0.12)")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 8,
        fontSize: 14,
        color: "var(--slate)",
        textDecoration: "none",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(99,102,241,0.08)";
        e.currentTarget.style.color = "var(--white)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--slate)";
      }}
    >
      {children}
    </Link>
  );
}
