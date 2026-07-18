// App chrome: shared site nav with active-link state.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/flows", label: "Flows" },
  { href: "/skills", label: "Skills" },
  { href: "/setup", label: "Setup" },
  { href: "/night-shift", label: "Night shift" },
  { href: "/differences", label: "Cursor vs Claude Code" },
];

export function SiteNav() {
  const pathname = usePathname();
  const isOn = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sitenav-bar">
      <nav className="sitenav">
        <Link className="brand" href="/">
          Dev Loop
        </Link>
        <span className="nlinks">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isOn(l.href) ? "on" : ""}
            >
              {l.label}
            </Link>
          ))}
        </span>
      </nav>
    </header>
  );
}
