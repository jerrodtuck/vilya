import type { Metadata } from "next";
import { NightShiftView } from "@/features/night-shift/night-shift-view";

export const metadata: Metadata = { title: "The Dev Loop — Night shift" };

export default function NightShiftPage() {
  return <NightShiftView />;
}
