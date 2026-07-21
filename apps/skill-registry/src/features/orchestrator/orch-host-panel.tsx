// Feature slice: orchestrator — desktop host toggle + host-filtered path/prompts (#285).
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SKILL_INVOKES } from "@/shared/skills/invokes";
import {
  DESKTOP_HOST_LABEL,
  DESKTOP_HOST_STORAGE_KEY,
  parseDesktopHost,
  type DesktopHostId,
} from "@/shared/ui/desktop-host";
import { FlowMap } from "@/shared/ui/flow-map";
import { PromptList } from "@/shared/ui/prompt-list";
import { ClaudeDispatchPath } from "./claude-dispatch-path";
import { CursorDispatchPath } from "./cursor-dispatch-path";
import { DEFAULT_DRAWER, FLOWS, FLOW_COLORS, NODES } from "./data";
import { EDGES, EDGE_LABELS, LENS_CONNECTOR, LENSES, NODE_GEOMS } from "./map-geometry";
import { filterPromptsForHost } from "./orch-host";
import { LAB_RUNS_ARE_CHIPS_ASIDE, PROMPTS } from "./prompts";

export function OrchHostPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = parseDesktopHost(searchParams.get("host"));
  const [host, setHost] = useState<DesktopHostId>(fromUrl ?? "cc");

  useEffect(() => {
    if (fromUrl) {
      setHost(fromUrl);
      try {
        localStorage.setItem(DESKTOP_HOST_STORAGE_KEY, fromUrl);
      } catch {
        /* ignore quota / private mode */
      }
      return;
    }
    try {
      const stored = parseDesktopHost(localStorage.getItem(DESKTOP_HOST_STORAGE_KEY));
      if (stored) setHost(stored);
    } catch {
      /* ignore */
    }
  }, [fromUrl]);

  function selectHost(next: DesktopHostId) {
    setHost(next);
    try {
      localStorage.setItem(DESKTOP_HOST_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("host", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const prompts = useMemo(() => filterPromptsForHost(PROMPTS, host), [host]);
  const seatInvoke =
    host === "cc" ? SKILL_INVOKES.orchestrator : SKILL_INVOKES.orchestratorCursor;

  return (
    <>
      <div className="diff-host-bar" data-host={host} style={{ marginTop: 16 }}>
        <div className="toggle" role="tablist" aria-label="Desktop host">
          <button
            type="button"
            role="tab"
            aria-selected={host === "cc"}
            className={host === "cc" ? "on" : ""}
            onClick={() => selectHost("cc")}
          >
            I&apos;m on Claude Code
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={host === "cursor"}
            className={host === "cursor" ? "on" : ""}
            onClick={() => selectHost("cursor")}
          >
            I&apos;m on Cursor
          </button>
        </div>
        <p className="muted diff-host-objective" style={{ marginTop: 10 }}>
          Seat this desktop: <code>{seatInvoke}</code>
          {" — "}
          {DESKTOP_HOST_LABEL[host]} orch skill.{" "}
          <b>Orchestrator</b> is the seat/job;{" "}
          <code>/vl-orch-claude</code> / <code>/vl-orch-cursor</code> are
          which desktop skill. Host story:{" "}
          <Link href="/differences">Two desktops</Link>.
        </p>
      </div>

      <FlowMap
        nodes={NODES}
        flows={FLOWS}
        flowColors={FLOW_COLORS}
        edges={EDGES}
        edgeLabels={EDGE_LABELS}
        nodeGeoms={NODE_GEOMS}
        lenses={LENSES}
        lensConnector={LENS_CONNECTOR}
        defaultDrawer={DEFAULT_DRAWER}
        prompts={prompts}
        ariaLabel="Skill orch map"
        aside={
          <div className="panel">
            <div className="kicker">How you multitask</div>
            <h3>Orch modes</h3>
            <p className="muted" style={{ margin: "8px 0 0", lineHeight: 1.5 }}>
              {LAB_RUNS_ARE_CHIPS_ASIDE}
            </p>
            <div className="modes" style={{ marginTop: 12 }}>
              <div className="mode" style={{ ["--m" as string]: "var(--start)" }}>
                <b>Serial</b>
                <span>
                  One issue = one branch = one worktree. The default clean unit
                  of work.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--epic)" }}>
                <b>Parallel (fan-out)</b>
                <span>
                  An Epic splits into sub-issues; each is an isolated slice in
                  its own worktree. You context-switch between independent
                  streams with no collisions.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--review)" }}>
                <b>Looped</b>
                <span>
                  review → refactor → re-review runs until <code>Ready</code>,
                  then auto-hands to <code>/vl-finish-feature</code>. The inner
                  loop you can automate.
                </span>
              </div>
              <div className="mode" style={{ ["--m" as string]: "var(--refactor)" }}>
                <b>Parallel lenses</b>
                <span>
                  One review fans out into VSA · SOLID · stack · Simplify
                  passes at once, then merges findings — faster than a single
                  sweep.
                </span>
              </div>
            </div>
            <div className="kicker" style={{ marginTop: 16 }}>
              Review output
            </div>
            <div className="sev">
              <span className="sevpill" style={{ color: "#ff6b8a", borderColor: "#5c2e38" }}>
                🔴 Blocker — merge waits
              </span>
              <span className="sevpill" style={{ color: "var(--refactor)", borderColor: "#5c4a2e" }}>
                🟠 Should-fix
              </span>
              <span className="sevpill" style={{ color: "#e8d24f", borderColor: "#565028" }}>
                🟡 Consider (stack)
              </span>
            </div>
          </div>
        }
      />

      {host === "cursor" ? <CursorDispatchPath /> : <ClaudeDispatchPath />}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Copy-paste · {DESKTOP_HOST_LABEL[host]}</div>
        <h3>Orch prompt library</h3>
        <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
          Standing orders and cards for this desktop. Fill the{" "}
          <code>&lt;placeholders&gt;</code> and paste. Every prompt also shows
          up in its node&apos;s detail panel above — click <b>Copy</b> on any of
          them.
        </p>
        <div className="lib">
          {prompts.map((g) => (
            <div
              key={g.group}
              className={`libcard${g.wide ? " wide" : ""}`}
              style={{ ["--lc" as string]: `var(${g.c})` }}
            >
              <h4>{g.group}</h4>
              <PromptList group={g} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
