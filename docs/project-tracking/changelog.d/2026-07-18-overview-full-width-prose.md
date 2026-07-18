# Overview prose spans the page width

The Overview's intro paragraph no longer stops at the shared 42rem `p.lead`
measure while the cards below it run the full content width (#191, operator
decision — screenshot-backed). The Overview view is now wrapped in an
`.overview` scope, and one rule widens its prose to the page container:
`.overview p.lead, .overview p.muted { max-width: none; }` — covering both
the hero lead and the Ask Vilya panel text (which the ≥1440px wide-screen
prose cap would otherwise pin at 60rem inside a wider panel).

Scoped, not global: `.lead` is used by eight other views and the ≥1440px
prose cap is site-wide, so every other page keeps its readability measure
unchanged — verified against `/orchestrator` (lead still 672px at 1600px
viewport) while the Overview's lead measures exactly the cards' width
(832px at 1280px, 902px at 1600px). Wraps clean at 375px, no body h-scroll.
