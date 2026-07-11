import type { Metadata } from "next";
import { FlowsView } from "@/features/flows/flows-view";

export const metadata: Metadata = { title: "The Dev Loop — Flows" };

export default function FlowsPage() {
  return <FlowsView />;
}
