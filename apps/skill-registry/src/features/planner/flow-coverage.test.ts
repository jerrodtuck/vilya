// Node click highlights every flow through that node. That only works if
// every node on the map belongs to at least one named flow, and every flow
// references only real node/edge ids.
import { describe, expect, it } from "vitest";
import { FLOWS, NODES } from "./data";
import { EDGES, NODE_GEOMS } from "./map-geometry";

const namedFlows = Object.entries(FLOWS).filter(([, f]) => f.nodes);

describe("planner flow coverage", () => {
  it("every map node belongs to at least one named flow", () => {
    for (const n of NODE_GEOMS) {
      const containing = namedFlows.filter(([, f]) => f.nodes?.includes(n.id));
      expect(containing.length, `node ${n.id} is in no flow`).toBeGreaterThan(0);
    }
  });

  it("flows reference only real node and edge ids", () => {
    const nodeIds = new Set(NODE_GEOMS.map((n) => n.id));
    const edgeIds = new Set(EDGES.map((e) => e.id));
    for (const [id, f] of namedFlows) {
      for (const n of f.nodes ?? []) {
        expect(nodeIds.has(n), `flow ${id} references unknown node ${n}`).toBe(
          true,
        );
      }
      for (const e of f.edges ?? []) {
        expect(edgeIds.has(e), `flow ${id} references unknown edge ${e}`).toBe(
          true,
        );
      }
    }
  });

  it("every map node has drawer content", () => {
    for (const n of NODE_GEOMS) {
      expect(NODES[n.id], `node ${n.id} has no drawer entry`).toBeDefined();
    }
  });
});
