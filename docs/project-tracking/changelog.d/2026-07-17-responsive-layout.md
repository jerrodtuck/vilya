# Site: responsive layout across viewports + nav label fix

Make the Dev Loop site read comfortably from phone to ultra-wide (#117).
Mobile/tablet: the nav collapses to a brand row plus a swipeable link
strip; frontmatter rows, the GITHUB-PROJECTS checklist, version history
rows, and the version-diff commit cards stack; the Flows and Night-shift
maps stop shrinking below tablet width and scroll inside their own stage;
markdown tables scroll in their own container; long inline-code tokens
wrap. The page body never scrolls horizontally at any checked width
(375/768/1280/2000px on every page). Wide screens: the content shell
grows fluidly past 1440px (64rem → 80rem by ~2030px) while prose stays
capped at today's measure — only grids, cards, tables, and the maps use
the extra room. The nav label is standardized on the page's own name:
"Cursor vs Claude Code" in nav, h1, and tab title.
