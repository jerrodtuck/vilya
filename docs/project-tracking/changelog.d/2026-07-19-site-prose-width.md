# Site prose fills the wrap

Intro lead and muted prose on every primary page now match Overview's
measure — `p.lead, p.muted { max-width: none; }` inside `.wrap` /
`--wrap-max`, replacing the shared 42rem lead cap and the Overview-only
override (#231, extends #191). Body prose in `.md` / `.pane` / `.setupsteps`
keeps the ≥1440px 60rem readability cap; flow maps and grids unchanged.
