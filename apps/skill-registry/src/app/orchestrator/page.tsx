import type { Metadata } from "next";
import { OrchestratorView } from "@/features/orchestrator/orchestrator-view";

export const metadata: Metadata = { title: "The Dev Loop — Orchestrator" };

export default function OrchestratorPage() {
  return <OrchestratorView />;
}
