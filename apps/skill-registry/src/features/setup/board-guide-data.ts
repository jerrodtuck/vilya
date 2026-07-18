// Feature slice: setup — data behind "The board" guided section (#172).
// Level fork, dependency commands, and board automations. The automations are
// the board-automation half of epic #169's mover map — the skill half is the
// home page's feature. Process canon: GITHUB-PROJECTS.md "One-time repo setup".

export const CANON_SETUP_URL =
  "https://github.com/jerrodtuck/vilya/blob/main/docs/project-tracking/GITHUB-PROJECTS.md#one-time-repo-setup";

export const PROJECT_CREATE_COMMAND = "gh project create --owner <user>";
export const PROJECT_SCOPE_COMMAND = "gh auth refresh -s project";

export type BoardLevel = {
  name: string;
  recommended: boolean;
  costs: string[];
};

// Keyed by owner kind — the only two owners Projects v2 supports.
export const BOARD_LEVELS: Record<"user" | "org", BoardLevel> = {
  user: {
    name: "User level",
    recommended: true,
    costs: [
      "Collaborators need a per-project invite each.",
      "Moving to an org later means recreating the project — field and option ids change, so every repo config block regenerates.",
    ],
  },
  org: {
    name: "Organization level",
    recommended: false,
    costs: [
      "Org Actions entitlements follow the org's plan, not your personal one — night-shift runners are the canon's worked example.",
      "Getting here from a user-level board is that one-time id migration, in every product repo's config block.",
    ],
  },
};

export type BoardAutomation = {
  workflow: string; // name as it appears in the project's Workflows pane
  setting: string; // what to configure once the workflow is open
  moverMap: boolean; // a mover-map transition per epic #169 (vs. board hygiene)
};

export const BOARD_AUTOMATIONS: BoardAutomation[] = [
  { workflow: "Auto-add to project", setting: "filter is:issue", moverMap: true },
  { workflow: "Item added to project", setting: "Status: Todo", moverMap: true },
  {
    workflow: "Item reopened",
    setting: "Status: In Progress",
    moverMap: true,
  },
  { workflow: "Pull request merged", setting: "Status: Done", moverMap: true },
  { workflow: "Item closed", setting: "Status: Done", moverMap: false },
  {
    workflow: "Auto-add sub-issues to project",
    setting: "turn on",
    moverMap: false,
  },
];
