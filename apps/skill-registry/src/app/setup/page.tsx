import type { Metadata } from "next";
import { SetupView } from "@/features/setup/setup-view";

export const metadata: Metadata = { title: "The Dev Loop — Setup" };

export default function SetupPage() {
  return <SetupView />;
}
