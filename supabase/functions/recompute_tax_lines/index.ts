import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE")!);

const LINE_MAP: Record<string, string> = {
  "1":  "gross_sales",
  "4":  "commissions",
  "8":  "advertising",
  "9":  "auto",
  "18": "office",
  "21": "repairs",
  "27": "other",
};

Deno.serve(async (req) => {
  const { p_user_id, p_year } = await req.json();

  // 1. wipe prior totals for the year
  await supabase.from("tax_lines").delete().eq("user_id", p_user_id).eq("year", p_year);

  // 2. aggregate reviewed tx
  const { data } = await supabase
    .from("transactions")
    .select("category_final, amount")
    .eq("reviewed", true)
    .eq("account_id", function (q: any) {
      return q.select("id").from("accounts").eq("user_id", p_user_id);
    });

  const totals: Record<string, number> = {};
  for (const tx of data || []) {
    const line = LINE_MAP[tx.category_final] || "other";
    totals[line] = (totals[line] || 0) + Number(tx.amount);
  }

  // 3. insert new totals
  const rows = Object.entries(totals).map(([line, amt]) => ({
    user_id: p_user_id,
    year: p_year,
    line_no: line,
    amount: amt,
  }));
  await supabase.from("tax_lines").insert(rows);

  return Response.json({ recomputed: rows.length });
});