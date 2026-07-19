import type { Metadata } from "next";
import { PlannerView } from "@/features/planner/planner-view";

export const metadata: Metadata = { title: "The Dev Loop — Planner" };

export default function PlannerPage() {
  return <PlannerView />;
}
