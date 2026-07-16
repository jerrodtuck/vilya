import type { Metadata } from "next";
import { DifferencesView } from "@/features/differences/differences-view";

export const metadata: Metadata = { title: "The Dev Loop — Cursor vs Claude Code" };

export default function DifferencesPage() {
  return <DifferencesView />;
}
