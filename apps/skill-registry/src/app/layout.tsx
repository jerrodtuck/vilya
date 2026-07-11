import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vilya — Skill Registry",
  description:
    "Git-native registry for the Vilya skills. The repo is the store; versions are commits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <nav className="sitenav">
            <Link className="brand" href="/">
              ◆ Vilya
            </Link>
            <span className="nlinks">
              <Link href="/">Registry</Link>
            </span>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
