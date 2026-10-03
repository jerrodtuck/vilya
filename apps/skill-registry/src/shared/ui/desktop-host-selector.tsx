"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DESKTOP_HOST_LABEL, DESKTOP_HOST_STORAGE_KEY, parseDesktopHost, type DesktopHostId } from "./desktop-host";

/** URL wins over the saved desktop; keep unrelated query parameters on selection. */
export function useDesktopHost() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = parseDesktopHost(params.get("host"));
  const [host, setHost] = useState<DesktopHostId>(fromUrl ?? "cc");
  useEffect(() => {
    try {
      if (fromUrl) localStorage.setItem(DESKTOP_HOST_STORAGE_KEY, fromUrl);
      setHost(fromUrl ?? parseDesktopHost(localStorage.getItem(DESKTOP_HOST_STORAGE_KEY)) ?? "cc");
    } catch { setHost(fromUrl ?? "cc"); } // Storage is optional in private browsing.
  }, [fromUrl]);
  function selectHost(next: DesktopHostId) {
    setHost(next);
    try { localStorage.setItem(DESKTOP_HOST_STORAGE_KEY, next); } catch { /* URL still works. */ }
    const nextParams = new URLSearchParams(params.toString());
    nextParams.set("host", next);
    router.replace(pathname + "?" + nextParams.toString(), { scroll: false });
  }
  return { host, selectHost };
}

export function DesktopHostSelector({ host, onSelect }: { host: DesktopHostId; onSelect: (host: DesktopHostId) => void }) {
  return <div className="toggle" role="group" aria-label="Desktop host">
    {(Object.keys(DESKTOP_HOST_LABEL) as DesktopHostId[]).map(id =>
      <button type="button" key={id} aria-pressed={host === id} className={host === id ? "on" : ""} onClick={() => onSelect(id)}>{DESKTOP_HOST_LABEL[id]}</button>
    )}
  </div>;
}

function HostContent({ codex, children }: { codex: ReactNode; children: ReactNode }) {
  const { host, selectHost } = useDesktopHost();
  return <><DesktopHostSelector host={host} onSelect={selectHost} />{host === "codex" ? codex : children}</>;
}

/** Composition slot: host-specific teaching stays in its owning feature. */
export function DesktopHostContent(props: { codex: ReactNode; children: ReactNode }) {
  return <Suspense fallback={<p>Loading desktop guidance…</p>}><HostContent {...props} /></Suspense>;
}
