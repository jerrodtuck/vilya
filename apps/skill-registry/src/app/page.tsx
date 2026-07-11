import type { Metadata } from "next";
import { OverviewView } from "@/features/overview/overview-view";

export const metadata: Metadata = { title: "The Dev Loop — Overview" };

export default function HomePage() {
  return <OverviewView />;
}
