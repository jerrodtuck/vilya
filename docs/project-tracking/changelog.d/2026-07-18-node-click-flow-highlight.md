### Fixed

- **Flow maps: clicking a step now lights the flow(s) through it** on both the
  Orchestrator and Architect maps (one shared component). A node in exactly one
  flow behaves like clicking that flow's chip; a node in several flows lights
  the union of their edges, each edge in its own flow color, with every
  containing chip active and a generated description line. Drawer-open,
  keyboard activation (Enter/Space), Everything mode, and the #159
  no-transition rule are all preserved. Archaeology across the component's full
  history showed node click never drove edge state — this is a built-to-spec
  gap fill, not a restore. New colocated data tests assert every map node
  belongs to at least one named flow. (#183)
