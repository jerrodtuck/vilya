import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Dev Loop",
  description:
    "VSA + SOLID skill orchestration for Claude Code + Cursor — the methodology, the orchestrator map, the skills, and the git-native registry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={GeistSans.className}>
        <SiteNav />
        <main className="wrap">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
