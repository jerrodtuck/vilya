import type { Metadata } from "next";
import { OrchestratorView } from "@/features/orchestrator/orchestrator-view";

export const metadata: Metadata = { title: "The Dev Loop — Orch" };

export default function OrchPage() {
  return <OrchestratorView />;
}
