import type { Metadata } from "next";
import { RegistryList } from "@/features/registry/registry-list";
import { SkillsReference } from "@/features/registry/skills-reference";

export const metadata: Metadata = { title: "The Dev Loop — Skills" };

export default function SkillsPage() {
  return (
    <>
      <RegistryList />
      <SkillsReference />
    </>
  );
}
