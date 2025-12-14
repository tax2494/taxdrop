"use client";
import { useEffect, useState } from "react";

type Tx = { id: string; merchant: string; amount: number; category_final: string | null };
const SCHEDULE_C_LINES = [
  { value: "1", label: "1 – Gross receipts or sales" },
  { value: "4", label: "4 – Commissions and fees" },
  { value: "8", label: "8 – Advertising" },
  { value: "9", label: "9 – Car and truck expenses" },
  { value: "18", label: "18 – Office expense" },
  { value: "21", label: "21 – Repairs and maintenance" },
  { value: "27", label: "27 – Other expenses" },
];

export default function ReviewPage() {
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    fetch("/api/review/list")
      .then((r) => r.json())
      .then((d) => setTxs(d));
  }, []);

  async function saveLine(txId: string, line: string) {
    await fetch("/api/review/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txId, line }),
    });
    // optimistic update
    setTxs((t) => t.map((x) => (x.id === txId ? { ...x, category_final: line } : x)));
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Review Transactions</h1>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Merchant</th>
            <th>Amount</th>
            <th>Schedule-C Line</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <tr key={t.id} className="border-b">
              <td>{t.merchant}</td>
              <td>${t.amount.toFixed(2)}</td>
              <td>
                <select
                  className="border rounded px-2 py-1"
                  value={t.category_final || ""}
                  onChange={(e) => saveLine(t.id, e.target.value)}
                >
                  <option value="">— pick —</option>
                  {SCHEDULE_C_LINES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}