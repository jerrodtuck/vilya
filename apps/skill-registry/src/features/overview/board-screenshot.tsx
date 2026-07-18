// Feature slice: overview — the real vilya board, as GitHub renders it (#185).
// Static snapshot; staleness is operator-accepted — the point is what the
// board looks like in the GitHub interface, not today's item counts.
import Image from "next/image";

export function BoardScreenshot() {
  return (
    <figure className="board-shot">
      <Image
        src="/board-example.png"
        alt="The vilya project board on GitHub: a dark-theme board view with the five Status columns — Todo, In Progress, Blocked, Verifying, and Done — each holding numbered vilya issue cards, with the Done column far ahead of the rest."
        width={2870}
        height={1719}
        sizes="(max-width: 1024px) 100vw, 60rem"
      />
      <figcaption>
        The vilya board on GitHub Projects — the same five Status columns, in
        the interface where the loop actually runs.
      </figcaption>
    </figure>
  );
}
