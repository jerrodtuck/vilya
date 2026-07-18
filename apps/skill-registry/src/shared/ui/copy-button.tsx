// Shared UI: copy-to-clipboard button (client leaf). Used by prompt-list.tsx
// on every page with a prompt library (orchestrator, architect, overview).
"use client";

import { useRef, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const done = () => {
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      /* clipboard unavailable */
    }
    document.body.removeChild(ta);
  };

  const copy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  };

  return (
    <button
      type="button"
      className={`copybtn${copied ? " done" : ""}`}
      onClick={copy}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
