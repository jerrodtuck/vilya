// Feature slice: version-diff. Pure line-diff (LCS) — no I/O, unit-testable.

export interface DiffCell {
  lineNo: number;
  text: string;
}

export type DiffRow =
  | { kind: "same"; left: DiffCell; right: DiffCell }
  | { kind: "change"; left: DiffCell; right: DiffCell }
  | { kind: "del"; left: DiffCell; right: null }
  | { kind: "add"; left: null; right: DiffCell };

/**
 * Side-by-side line diff. Rows align unchanged lines; runs of deletions and
 * additions between them are zipped pairwise into "change" rows, with the
 * overhang rendered as one-sided "del" / "add" rows.
 */
export function computeLineDiff(oldText: string, newText: string): DiffRow[] {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const n = a.length;
  const m = b.length;

  // LCS lengths, dp[i][j] = LCS of a[i..] and b[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let dels: DiffCell[] = [];
  let adds: DiffCell[] = [];
  const flush = () => {
    const len = Math.max(dels.length, adds.length);
    for (let t = 0; t < len; t++) {
      const left = t < dels.length ? dels[t] : null;
      const right = t < adds.length ? adds[t] : null;
      if (left && right) rows.push({ kind: "change", left, right });
      else if (left) rows.push({ kind: "del", left, right: null });
      else if (right) rows.push({ kind: "add", left: null, right });
    }
    dels = [];
    adds = [];
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flush();
      rows.push({
        kind: "same",
        left: { lineNo: i + 1, text: a[i] },
        right: { lineNo: j + 1, text: b[j] },
      });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      dels.push({ lineNo: i + 1, text: a[i] });
      i++;
    } else {
      adds.push({ lineNo: j + 1, text: b[j] });
      j++;
    }
  }
  for (; i < n; i++) dels.push({ lineNo: i + 1, text: a[i] });
  for (; j < m; j++) adds.push({ lineNo: j + 1, text: b[j] });
  flush();

  return rows;
}

export function diffStats(rows: DiffRow[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const r of rows) {
    if (r.kind === "add" || r.kind === "change") added++;
    if (r.kind === "del" || r.kind === "change") removed++;
  }
  return { added, removed };
}

function splitLines(text: string): string[] {
  if (text === "") return [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines[lines.length - 1] === "") lines.pop(); // ignore trailing newline
  return lines;
}
