// Feature slice: overview — founding scar that made the board non-negotiable.
// Plain prose section (not a card/panel): one job before BoardStrip teaches
// the Status flow. Copy chain: text-file trackers → parallel stomp → board-only.

export function FoundingWhy() {
  return (
    <section
      className="founding-why"
      aria-labelledby="founding-why-heading"
    >
      <p className="mono-kicker">Why the board</p>
      <h2 id="founding-why-heading">Files don&apos;t survive parallel work</h2>
      <p className="muted">
        Status, changelogs, and the roadmap used to live in text files — fine
        for one stream, fatal once parallel agent sessions stomped the same
        trackers. The Dev Loop&apos;s answer is hard on purpose:{" "}
        <b>live work exists only on the GitHub Projects board</b>, so a session
        with zero chat memory can still pick up from shared state alone.
        History and design intent stay in docs (<code>changelog.d/</code>,
        specs, <code>DECISIONS.md</code>) — append-only or single-writer, not a
        racing status dashboard. This is the scar under &quot;No markdown
        trackers.&quot;
      </p>
    </section>
  );
}
