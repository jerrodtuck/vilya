// Feature slice: night-shift — Troubleshoot symptom → fix table.
import { TROUBLESHOOT_ROWS } from "./operator-guide";

export function TroubleshootTable() {
  return (
    <div className="panel ns-trouble" style={{ marginTop: 12 }}>
      <table>
        <thead>
          <tr>
            <th>Symptom</th>
            <th>Fix</th>
          </tr>
        </thead>
        <tbody>
          {TROUBLESHOOT_ROWS.map((row) => (
            <tr key={row.symptom}>
              <td>{row.symptom}</td>
              <td>{row.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
