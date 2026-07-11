import type { Metadata } from "next";
import { SiteNav } from "./site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Dev Loop",
  description:
    "VSA + SOLID skill orchestration for Claude Code + Cursor — the methodology, the flows, the skills, and the git-native registry.",
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
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
