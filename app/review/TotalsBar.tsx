"use client";
import { useTotals } from "./TotalsContext";

const LINE_NAMES: Record<string, string> = {
  "1": "Gross sales",
  "4": "Commissions",
  "8": "Advertising",
  "9": "Auto",
  "18": "Office",
  "21": "Repairs",
  "27": "Other",
};

export default function TotalsBar() {
  const { totals } = useTotals();
  return (
    <div className="bg-gray-50 p-4 rounded mb-4">
      <h2 className="font-semibold mb-2">2024 Running Totals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {Object.entries(totals).map(([line, amt]) => (
          <div key={line}>
            <div className="text-gray-600">{LINE_NAMES[line] ?? `Line ${line}`}</div>
            <div className="font-semibold">${amt.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}