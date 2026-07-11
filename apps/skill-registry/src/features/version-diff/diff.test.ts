import { describe, expect, it } from "vitest";
import { computeLineDiff, diffStats } from "./diff";

describe("computeLineDiff", () => {
  it("returns all-same rows for identical text", () => {
    const rows = computeLineDiff("a\nb\nc\n", "a\nb\nc\n");
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.kind === "same")).toBe(true);
    expect(diffStats(rows)).toEqual({ added: 0, removed: 0 });
  });

  it("treats CRLF and LF as equivalent", () => {
    const rows = computeLineDiff("a\r\nb\r\n", "a\nb\n");
    expect(rows.every((r) => r.kind === "same")).toBe(true);
  });

  it("marks pure additions", () => {
    const rows = computeLineDiff("a\nc\n", "a\nb\nc\n");
    expect(rows.map((r) => r.kind)).toEqual(["same", "add", "same"]);
    const add = rows[1];
    expect(add.kind === "add" && add.right.text).toBe("b");
    expect(add.kind === "add" && add.right.lineNo).toBe(2);
  });

  it("marks pure deletions", () => {
    const rows = computeLineDiff("a\nb\nc\n", "a\nc\n");
    expect(rows.map((r) => r.kind)).toEqual(["same", "del", "same"]);
  });

  it("zips a deletion run with an addition run into change rows", () => {
    const rows = computeLineDiff("a\nx\ny\nd\n", "a\nX\nY\nd\n");
    expect(rows.map((r) => r.kind)).toEqual(["same", "change", "change", "same"]);
    const first = rows[1];
    expect(first.kind === "change" && first.left.text).toBe("x");
    expect(first.kind === "change" && first.right.text).toBe("X");
    expect(diffStats(rows)).toEqual({ added: 2, removed: 2 });
  });

  it("renders the overhang of an uneven change run one-sided", () => {
    const rows = computeLineDiff("a\nx\nd\n", "a\nX\nY\nZ\nd\n");
    expect(rows.map((r) => r.kind)).toEqual([
      "same",
      "change",
      "add",
      "add",
      "same",
    ]);
  });

  it("diffs against an empty old text as all additions (new file)", () => {
    const rows = computeLineDiff("", "a\nb\n");
    expect(rows.map((r) => r.kind)).toEqual(["add", "add"]);
  });

  it("diffs against an empty new text as all deletions", () => {
    const rows = computeLineDiff("a\nb\n", "");
    expect(rows.map((r) => r.kind)).toEqual(["del", "del"]);
  });

  it("returns no rows for two empty texts", () => {
    expect(computeLineDiff("", "")).toEqual([]);
  });

  it("numbers lines per side independently", () => {
    const rows = computeLineDiff("a\nb\n", "b\n");
    // 'a' deleted, then 'b' aligns: left line 2, right line 1
    const same = rows.find((r) => r.kind === "same");
    expect(same && same.kind === "same" && same.left.lineNo).toBe(2);
    expect(same && same.kind === "same" && same.right.lineNo).toBe(1);
  });
});
