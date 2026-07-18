import type { Metadata } from "next";
import { ArchitectView } from "@/features/architect/architect-view";

export const metadata: Metadata = { title: "The Dev Loop — Architect" };

export default function ArchitectPage() {
  return <ArchitectView />;
}
